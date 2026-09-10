# 排障 / 升级 / 兼容性路线卡

## 什么时候进入这里

- 用户报告报错、行为异常、升级后不兼容、文档冲突、迁移问题
- 用户需要先判断“是不是用法错了”还是“版本 / 能力不匹配”

## 推荐路径

1. 先读 `references/rules/anti-hallucination.md`
2. 根据问题类型补读：
   - 框架行为问题：`references/router/task-framework.md`
   - UI / 组件问题：`references/router/task-ui.md`
   - API 问题：`references/router/task-api.md`
3. 如果属于升级迁移，再读 `references/ray/INDEX.md` 中 `Section = guide` 的 Key，进入 `references/ray/guide/<key>/` 下相关文档

## 处理原则

- 先缩小到具体能力面，再读文档
- 先确认“文档有没有”，再判断“实现对不对”
- 如果现象描述不足，优先要求补充上下文，而不是直接猜原因

## 离开前检查

- 是否明确指出依据文档还是依据现象推断
- 是否给出最小修复路径
- 是否避免把猜测说成确定结论
