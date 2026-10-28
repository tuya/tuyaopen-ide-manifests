# Product task catalogue maintenance

This guide replaces the downstream skill-maker role in the isolated tasks-v2 catalogue. It is repository maintenance guidance, never a skill to install into an application.

The legacy default `skills/index.json` remains compatible with old consumers. Its 24 entries must not be replaced by the 19-entry catalogue on the same default feed: old consumers may force-delete locally modified retired skills. Build the explicit new source with:

```
python3 scripts/build-task-skills-profile.py --output /tmp/tuya-task-skills-v2
python3 scripts/validate-skills-index.py /tmp/tuya-task-skills-v2/skills/index.json
```

Use an absent or empty output directory. Keep the result on a separately selected source until the release/distribution policy guarantees compatible consumers. This change does not publish or switch a default remote feed.

Task bodies live in `task-skills/<id>.md`; corrected attachments in `task-skills/resources/<id>/`. Unchanged payload resources are copied from the legacy source. `roles.json` defines both languages' task summaries and triggers. The generator preserves MiniApp workflow scripts and emits `payload-migrations.json` for every retired file. Add exact destination/resource mappings when a unique resource moves; a generic disposition is not evidence that its behavior was tested.

One skill owns one meaningful task. Workflows compose tasks only for an explicitly requested sequence and endpoint. No task references a global start router for CLI identity, confirmation or output contracts: use the installed schema and effective-payload discovery. API references stay attached to their task; nested files named SKILL.md must not register accidental independent skills.

Keep `id`, third-level directory and frontmatter name equal. `group` selects the install unit; `surface` selects display filtering; `sdks` selects product compatibility (omitted defaults to TuyaOpen). Do not infer any from another. TuyaOS tasks do not invent TuyaOpen CLI coverage. Dual-line cloud/MiniApp tasks use their available Host/provider tools.

Resolve project, then global, then catalogue. All files for an execution come from that root/contentHash. Broken higher-priority copies fail explicitly. Retiring a skill requires recorded unmodified hashes for every installed copy; missing proof preserves the copy. An install failure must not trigger retirement.

Run the legacy and generated validators, changed script tests and profile migration tests. Bump skill versions for changed legacy payloads, domain versions for index changes, and publishedAt when publishing. Keep release/versioned-source separation explicit; no new source is automatically published by the generator.
