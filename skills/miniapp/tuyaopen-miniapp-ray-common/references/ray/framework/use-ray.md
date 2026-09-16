# Ray 使用与升级管理

## 使用

必须引入 `@ray-js/ray` 与 `@ray-js/cli` 作为框架基础包，并建议保持最新版本。

> 对于老旧版本可能存在 `@ray-js/api`、`@ray-js/components`、`@ray-js/framework` 的基础包依赖，建议在 `package.json` 中删除其他 Ray 运行时基础包的依赖，只保留 `@ray-js/ray` 即可，`@ray-js/ray` 已经对各种运行时依赖做了聚合。

## 升级

建议在升级 Ray 的运行时依赖 `@ray-js/ray` 与编译时依赖 `@ray-js/cli` 时保持最新版本，并尽量让这两个包的版本保持一致。

```json
"devDependencies": {
  "@ray-js/cli": "x.x.x"
},
"dependencies": {
  "@ray-js/ray": "x.x.x"
}
```
