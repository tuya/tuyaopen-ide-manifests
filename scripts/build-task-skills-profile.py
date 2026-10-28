#!/usr/bin/env python3
"""Build an isolated task catalogue; never replace the legacy default source."""
import argparse
import json
from pathlib import Path
import re
import shutil

REPO = Path(__file__).resolve().parent.parent
RETIRED = {'tuyaopen-start', 'tuyaopen-embedded', 'tuyaopen-skill-maker', 'iot-product-workflow', 'miniapp-development-workflow'}
BASE = {'tuyaopen-embedded-' + x for x in ['env-setup','project','hardware','build','flash','cli-debug','code-check']}
TUYAOS = {'tuyaos-build', 'tuyaos-hardware-vibe-coding'}
SUCCESSORS = {'tuyaopen-start':'tuyaopen-embedded-env-setup', 'tuyaopen-embedded':'tuyaopen-embedded-env-setup',
              'iot-product-workflow':'tuyaopen-cloud', 'miniapp-development-workflow':'tuyaopen-miniapp',
              'tuyaopen-skill-maker':'catalogue maintenance guide'}
COMMANDS = {'project':'project info','config':'config list','demos':'demos list','manifests':'manifests status',
            'sdk':'sdk platform','diag':'diag doctor','firmware':'firmware build','hardware':'hardware list-used',
            'boards':'boards list','license':'license list','dependency':'dependency list','skills':'skills list',
            'schema':'schema list'}


def body(text):
    if text.startswith('---\n'):
        return text.split('\n---', 1)[1].lstrip('\n')
    return text


def build(output):
    output = Path(output).resolve()
    if output == REPO or REPO.is_relative_to(output):
        raise ValueError('Output cannot replace the repository or an ancestor')
    if output.exists() and any(output.iterdir()):
        raise ValueError('Output must be absent or empty; never overwrite an existing catalogue')
    source = json.loads((REPO/'skills/index.json').read_text())
    roles = json.loads((REPO/'task-skills/roles.json').read_text())
    items = []
    output.mkdir(parents=True, exist_ok=True)
    migration = []
    for original in source['items']:
        sid = original['id']
        if sid in RETIRED:
            continue
        item = json.loads(json.dumps(original))
        item['defaultEnabled'] = sid in BASE | TUYAOS
        item['summary'] = roles[sid]
        item['whenToUse'] = roles[sid]
        item['requires'] = [x for x in item.get('requires', []) if x not in RETIRED]
        item['related'] = sorted({SUCCESSORS.get(x,x) for x in item.get('related',[]) if x != 'tuyaopen-skill-maker'} - {sid})
        item['aliases'] = [x for x in item.get('aliases',[]) if x not in RETIRED]
        # This explicit source is a new behavioural revision; legacy source versions stay independent.
        major, minor, patch = map(int,item['version'].split('.'))
        item['version'] = f'{major}.{minor+1}.0'
        target = output/item['source']['localPath']
        shutil.copytree(REPO/item['source']['localPath'], target, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
        merge_id = {'tuyaopen-cloud':'iot-product-workflow', 'tuyaopen-miniapp':'miniapp-development-workflow'}.get(sid)
        if merge_id:
            previous = next(x for x in source['items'] if x['id']==merge_id)
            item['commands'] = sorted(set(item.get('commands',[])+previous.get('commands',[])))
        if sid == 'tuyaopen-miniapp':
            old = REPO/'skills/miniapp/miniapp-development-workflow'
            for f in sorted(old.rglob('*')):
                if not f.is_file() or f.name == 'SKILL.md' or '__pycache__' in f.parts or f.suffix == '.pyc':
                    continue
                relative = f.relative_to(old)
                dest = target/relative
                if dest.exists() and dest.read_bytes() != f.read_bytes():
                    relative = Path('references/former-workflow')/relative
                    dest = target/relative
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(f,dest)
                migration.append({'from':str(f.relative_to(REPO)), 'to':str(dest.relative_to(output))})
        if sid == 'tuyaopen-embedded-env-setup':
            dest = target/'scripts/resolve_cli.py';dest.parent.mkdir(exist_ok=True)
            shutil.copy2(REPO/'skills/core/tuyaopen-start/scripts/resolve_cli.py',dest)
            migration.append({'from':'skills/core/tuyaopen-start/scripts/resolve_cli.py','to':str(dest.relative_to(output))})
        if sid == 'tuyaopen-embedded-build':
            for name in ['CONFIG_CLI.md','TOS_COMMANDS.md']:
                shutil.copy2(REPO/'skills/embedded/tuyaopen-embedded-project/references'/name,target/'references'/name)
        if sid == 'tuyaopen-workflow-embedded-dev':
            item['requires'] = ['tuyaopen-embedded-'+x for x in ['project','hardware','build','flash','cli-debug','code-check']]
            # Old state recipes must not remain executable competing instructions.
            for f in ['STATE_HAS_DPS.md','STATE_BUILT_ONLINE.md','DEBUG_LOOP_AND_DEVICE_STATE.md']:
                (target/'references'/f).write_text('Use the parent workflow and the effective task skills for this stage.\n')
        if sid == 'tuyaos-hardware-vibe-coding':
            item['requires'] = ['tuyaos-build']
            for f in target.glob('peripheral-drivers/**/SKILL.md'):
                f.rename(f.with_name('reference.md'))
        for f in target.rglob('*'):
            if not f.is_file() or f.suffix not in ['.md','.py','.mjs','.js','.json']:
                continue
            text = f.read_text()
            for old,new in SUCCESSORS.items():
                text = re.sub(r'(?<![\w-])'+re.escape(old)+r'(?![\w-])', lambda _: new, text)
            if sid.startswith('tuyaos-'):
                text = text.replace('`tuyaopen-flash`','the IDE TuyaOS Flash/Monitor surface')
                text = text.replace('/SKILL.md','/reference.md')
                if 'peripheral-drivers' in f.parts:
                    text = text.replace('`SKILL.md`', '`reference.md`')
            f.write_text(text)
        resource_overlays = REPO/'task-skills/resources'/sid
        if resource_overlays.exists():
            shutil.copytree(resource_overlays, target, dirs_exist_ok=True)
        overlay = REPO/'task-skills'/f'{sid}.md'
        content = overlay.read_text() if overlay.exists() else body((target/'SKILL.md').read_text())
        if not overlay.exists():
            # Remove the obsolete main-file CLI/router preamble; keep unique API/PRD knowledge.
            content = re.sub(r'## No `tuyaopen-cli` CLI coverage.*?(?=\n## |\Z)','',content,flags=re.S)
        content = content.replace('需求生成指南：超出 Smart UI 范围时查 `tuyaopen-embedded-env-setup` 路由表。', '需求生成指南：按需解析 `tuyaopen-miniapp-requirement-guide`。')
        content = content.replace('Ray API / 生命周期等通用开发知识：超出 Smart UI 范围时查 `tuyaopen-embedded-env-setup` 路由表。', 'Ray API / 生命周期等通用开发知识：按需解析 `tuyaopen-miniapp-ray-common`。')
        content = content.replace('Smart UI 组件库相关需求：先查 `tuyaopen-embedded-env-setup` 路由表，再按需读取对应技能。', 'Smart UI 组件库相关需求：按需解析 `tuyaopen-miniapp-smart-ui`。')
        groups = item.get('cli',{}).get('groups','none')
        if groups == 'none':
            shortcut = '## No `tuyaopen-cli` CLI coverage\n\nUse the task\'s declared tools or local resources; this payload has no direct project CLI command.\n\n'
        else:
            shortcut = '## Shortcuts\n\n| Intent | Command |\n|---|---|\n'
            shortcut += ''.join(f'| {g} task interface | `tuyaopen-cli {COMMANDS[g]}` |\n' for g in groups)
            shortcut += '\nQuery the installed command schema before execution. Resolve the effective payload and keep its body, attachments and scripts together.\n\n'
        description = (item.get('whenToUse',{}).get('en','')+' '+item.get('whenToUse',{}).get('zh-CN','')).replace("'","''").replace('\n',' ')
        compat = "compatibility: Compatible IDE Agent Host or project tooling; inspect the active SDK and resolved payload.\n" if "tuyaopen" in item.get("sdks", ["tuyaopen"]) else "compatibility:\n- TuyaOS IDE Agent Host; inspect the active SDK and resolved payload.\n"
        header = f"---\nname: {sid}\ndescription: '{description}'\nlicense: Apache-2.0\n{compat}metadata:\n  version: {item['version']}\n  owner: {item.get('owner','embedded-team')}\n  deprecated: false\n---\n\n"
        if content.startswith('# '):
            title,_,rest = content.partition('\n')
            content = title+'\n\n'+shortcut+rest.lstrip()
        else: content=shortcut+content
        (target/'SKILL.md').write_text(header+content)
        items.append(item)
    assert len(items)==19
    source['items']=items
    source['profile']='tasks-v2'
    source['consumerRequirements']=['effective-skill-resolution','safe-retirement','host-skill-discovery']
    (output/'skills/index.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')
    registry=json.loads((REPO/'registry.json').read_text())
    major, minor, _ = map(int, registry['manifests']['skills']['version'].split('.'))
    registry['manifests']={'skills':{**registry['manifests']['skills'],'version':f'{major}.{minor+1}.0'}}
    (output/'registry.json').write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
    shutil.copy2(REPO/'task-skills/BOOTSTRAP.md',output/'skills/README.md')
    (output/'docs').mkdir(exist_ok=True)
    shutil.copy2(REPO/'docs/skill-authoring.md', output/'docs/skill-authoring.md')
    dispositions = json.loads((REPO/'task-skills/retired-files.json').read_text())
    migrated = {x['from'] for x in migration}
    seen = set()
    for sid in sorted(RETIRED):
        entry = next(x for x in json.loads((REPO/'skills/index.json').read_text())['items'] if x['id']==sid)
        for f in sorted((REPO/entry['source']['localPath']).rglob('*')):
            if not f.is_file() or '__pycache__' in f.parts or f.suffix == '.pyc':
                continue
            relative = str(f.relative_to(REPO))
            seen.add(relative)
            if relative in migrated:
                continue
            decision = dispositions.get(relative)
            if not decision or not decision.get('reason') or not decision.get('targets'):
                raise ValueError('Missing explicit retired-file disposition: '+relative)
            if any(not (output/target).is_file() for target in decision['targets']):
                raise ValueError('Missing migration destination: '+relative)
            migration.append({'from':relative, **decision})
    if set(dispositions) - seen:
        raise ValueError('Stale retired-file dispositions: '+str(set(dispositions)-seen))
    (output/'payload-migrations.json').write_text(json.dumps(migration,ensure_ascii=False,indent=2)+'\n')
    return source


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',required=True);a=p.parse_args()
    result=build(a.output)
    print(json.dumps({'output':str(Path(a.output).resolve()),'items':len(result['items']),
                      'defaults':[x['id'] for x in result['items'] if x['defaultEnabled']]},ensure_ascii=False))
