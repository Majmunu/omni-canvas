# CE-001 Runbook：初始化工程与目录（React18 + TypeScript + Zustand）

## 范围说明
- 仅覆盖 CE-001：工程初始化、目录骨架、`lint/build/test` 基线、错误边界、基础日志。
- 不包含 CE-002 及后续功能需求。

---

### Task 1
- **title**: 统一工程基线与目录骨架
- **goal**: 建立可执行的项目结构与约定，确保后续任务有一致落点。
- **concrete steps**:
  1. 确认包管理器（`pnpm` 或 `npm`）并固定到 `README`/约定文档。
  2. 创建目录骨架：`src/app`、`src/pages`、`src/components`、`src/store`、`src/core/logger`、`src/core/error`、`tests`。
  3. 补齐 `.gitignore` 的前端常见忽略项（`node_modules`、构建产物、覆盖率目录等）。
- **acceptance criteria**:
  - 目录结构存在且命名一致。
  - 团队可从仓库直接看出工程分层。
- **test points**:
  - 目录检查：`tree -L 2 src`（或等价命令）。
  - 约定检查：包管理器与目录说明可被新成员复用。
- **suggested commit message**: `chore(ce-001): bootstrap project folders and baseline conventions`

### Task 2
- **title**: 初始化 React18 + TypeScript 工程
- **goal**: 得到可启动的 React18 + TS 最小工程，支持本地开发。
- **concrete steps**:
  1. 使用标准脚手架初始化 React18 + TS（推荐 Vite React TS 模板）。
  2. 清理模板示例页面，保留最小可运行入口。
  3. 确认 `dev` 脚本可本地启动。
- **acceptance criteria**:
  - `npm/pnpm run dev` 可成功启动。
  - 页面无脚手架示例噪音，保留最小基线。
- **test points**:
  - 启动检查：`run dev` 返回可访问地址。
  - 编译时无 TypeScript 报错。
- **suggested commit message**: `chore(ce-001): initialize React18 TypeScript app scaffold`

### Task 3
- **title**: 接入 Zustand 状态管理基线
- **goal**: 提供最小全局状态 store，验证 Zustand 在项目中可用。
- **concrete steps**:
  1. 安装 Zustand 依赖。
  2. 在 `src/store` 创建最小 store（如 `app` 状态与更新 action）。
  3. 在根页面消费一次 store，验证读写流程。
- **acceptance criteria**:
  - 项目可编译且 Zustand store 被实际使用。
  - store 结构清晰，可作为后续功能扩展入口。
- **test points**:
  - 类型检查通过。
  - 手工验证：状态变更可驱动 UI 更新。
- **suggested commit message**: `feat(ce-001): add zustand store baseline`

### Task 4
- **title**: 建立 Lint 规则与执行脚本
- **goal**: 建立统一静态检查入口，防止低级问题进入主线。
- **concrete steps**:
  1. 配置 ESLint（TypeScript + React + Hooks 基础规则）。
  2. 增加 `lint` 与 `lint:fix` 脚本。
  3. 确保忽略文件配置合理（构建目录、覆盖率目录）。
- **acceptance criteria**:
  - `run lint` 可执行并给出稳定结果。
  - 新增代码能被规则覆盖到。
- **test points**:
  - 执行 `run lint` 返回 0。
  - 人工制造一个 lint 问题，确认可被检测。
- **suggested commit message**: `chore(ce-001): setup eslint and lint scripts`

### Task 5
- **title**: 建立测试框架与基础用例
- **goal**: 具备可运行的单元测试基线，支持后续 TDD/回归。
- **concrete steps**:
  1. 接入测试工具（推荐 Vitest + Testing Library + jsdom）。
  2. 增加 `test`、`test:run`、`test:coverage` 脚本。
  3. 编写 1-2 个基础测试（组件渲染、store 行为）。
- **acceptance criteria**:
  - `run test:run` 能稳定通过。
  - 覆盖率命令可产出报告。
- **test points**:
  - 执行测试脚本成功。
  - 基础测试包含正常路径与至少一个边界断言。
- **suggested commit message**: `test(ce-001): setup vitest and baseline tests`

### Task 6
- **title**: 构建与类型检查基线打通
- **goal**: 确保工程具备可交付的 build 能力与严格类型门禁。
- **concrete steps**:
  1. 配置 `typecheck` 脚本（`tsc --noEmit`）。
  2. 配置 `build` 脚本并验证产物输出目录。
  3. 新增统一质量命令（如 `check` = lint + typecheck + test）。
- **acceptance criteria**:
  - `run build` 成功产出。
  - `run typecheck` 通过且无隐式错误。
- **test points**:
  - 连续执行 `lint`、`typecheck`、`test:run`、`build` 均通过。
- **suggested commit message**: `chore(ce-001): add typecheck build and quality gate scripts`

### Task 7
- **title**: 实现并接入全局错误边界
- **goal**: React 渲染层异常可被捕获并展示可控降级界面。
- **concrete steps**:
  1. 在 `src/core/error` 创建 `ErrorBoundary`。
  2. 提供通用 fallback UI（简洁、可识别、无敏感信息）。
  3. 在应用根节点挂载错误边界。
- **acceptance criteria**:
  - 子组件抛出异常时不会导致空白页崩溃。
  - fallback UI 可见且行为可预期。
- **test points**:
  - 单测/集成测试：模拟子组件抛错，断言 fallback 渲染。
  - 手工验证：异常后页面仍可交互（至少可刷新/重试入口）。
- **suggested commit message**: `feat(ce-001): add global error boundary with fallback ui`

### Task 8
- **title**: 建立基础日志模块并与错误边界联动
- **goal**: 提供统一日志入口，支持开发期排错与最小可观测性。
- **concrete steps**:
  1. 在 `src/core/logger` 实现日志接口（`info/warn/error`）。
  2. 日志输出按环境分级（开发详细、生产最小暴露）。
  3. 在 ErrorBoundary 捕获流程中接入 `logger.error`。
- **acceptance criteria**:
  - 业务代码不直接散落 `console.*`，统一走 logger 封装。
  - 错误边界捕获异常后有结构化日志输出。
- **test points**:
  - 单测：mock logger，验证异常路径调用次数与参数。
  - 手工验证：触发错误时日志内容包含错误摘要与上下文。
- **suggested commit message**: `feat(ce-001): add base logger and integrate with error handling`