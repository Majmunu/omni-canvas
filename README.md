# Zero Code Canvas Explore

CE-001 Task 1 工程基线文档，用于统一目录骨架和协作约定。

## 包管理器约定

- 固定使用 `npm`（仓库包含 `package-lock.json`）。
- 安装依赖：`npm install`
- 本地开发：`npm run dev`

## 目录骨架

```text
src/
  app/             # 应用装配与入口编排
  pages/           # 页面级容器
  components/      # 通用组件
  store/           # 状态管理
  core/
    logger/        # 日志基础模块
    error/         # 错误处理基础模块
tests/             # 测试目录
```

说明：当前仅建立目录落点，不引入新技术栈或业务实现，供后续 CE-001 子任务持续填充。
