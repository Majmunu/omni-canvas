# CE-002 Runbook：编辑器 App Shell 五区布局

## 范围说明
- 仅覆盖 CE-002：编辑器 App Shell 五区布局，包括顶栏、左侧面板、画布区、右侧面板、底部状态栏。
- 目标是提供最小可运行的布局骨架、占位内容、基础样式与测试锚点。
- 不包含 palette、layers、inspector、renderer 等实际功能接线，不引入 CE-004 及后续的数据结构或类型设计。

## 实施约束
- 技术栈维持 React 18 + TypeScript + Zustand；本 CE 不要求新增复杂状态模型。
- 仅使用基础 CSS，不引入 MUI、Antd、Tailwind 等 UI 框架。
- 布局需在小屏下不崩溃，区域允许独立滚动。
- 每个主要区域都要提供明确的 `data-testid` 与 `aria-label`，便于后续测试与无障碍校验。
- 统一验收命令使用 `npm run check`；`npm run dev` 若因沙箱 `EPERM` 失败，不作为硬性阻塞项。

---

### Task 1
- **title**: 用编辑器壳体替换现有计数器示例入口
- **goal**: 将当前 `App` 的示例内容切换为编辑器页面骨架，建立 CE-002 的唯一渲染入口。
- **steps**:
  1. 审查当前 `src/App.tsx`、`src/index.css`、现有测试，确认需要替换的计数器示例与样式范围。
  2. 在现有结构内引入编辑器壳体根节点，避免直接把布局逻辑堆在单个 JSX 块中。
  3. 保持入口简单清晰，后续面板与样式可独立演进。
- **acceptance**:
  - 应用默认渲染为编辑器壳体，而非计数器示例。
  - 根节点具备清晰的页面级语义和稳定测试锚点。
  - 执行 `npm run check` 通过。
- **suggested commit message**: `feat(ce-002): replace demo app with editor shell entry`

### Task 2
- **title**: 搭建五区语义结构与最小占位内容
- **goal**: 实现顶栏、左侧面板、画布区、右侧面板、底部状态栏五个区域的 DOM 结构与最小占位内容。
- **steps**:
  1. 按五区拆分组件或清晰的 JSX 分区，避免后续功能接入时再次重构整体骨架。
  2. 为每个区域提供最小占位文案，例如工具标题、面板说明、空状态提示、状态栏摘要。
  3. 为每个区域补齐稳定的 `data-testid` 和描述性的 `aria-label`。
- **acceptance**:
  - 页面中可稳定识别五个主区域。
  - 五个区域均有最小占位内容，页面不出现空白块。
  - 五个区域均具备明确的 `data-testid` 与 `aria-label`。
  - 执行 `npm run check` 通过。
- **suggested commit message**: `feat(ce-002): add five-region editor shell structure`

### Task 3
- **title**: 实现响应式五区布局与滚动容器
- **goal**: 用基础 CSS 完成桌面与小屏可用的五区布局，并确保各区域在内容超出时可独立滚动。
- **steps**:
  1. 设计桌面布局方案，优先使用 CSS Grid/Flex 组合实现顶栏、主体三列、底栏的稳定分区。
  2. 为左侧面板、画布区、右侧面板、底部状态栏设置合理的 `minmax`、`overflow`、`gap`、边框和背景层级。
  3. 增加小屏断点策略，使三列主体可收缩或改为纵向堆叠，避免横向挤爆与不可达内容。
  4. 验证根容器和子区域高度链路，避免 `overflow` 配置无效。
- **acceptance**:
  - 桌面宽度下呈现明确的五区布局关系。
  - 小屏下布局不重叠、不溢出视口、无明显内容遮挡。
  - 各主区域在内容超出时可独立滚动。
  - 执行 `npm run check` 通过。
- **suggested commit message**: `feat(ce-002): implement responsive editor shell layout styles`

### Task 4
- **title**: 补齐基础可访问性与测试选择器约定
- **goal**: 让布局骨架具备后续自动化测试和无障碍检查所需的稳定接口。
- **steps**:
  1. 为页面级容器和五个区域选择合适的语义标签或 `role`，确保测试查询与阅读器语义一致。
  2. 统一 `data-testid` 命名规则，避免后续 CE 因命名漂移造成测试重写。
  3. 校验标题层级、按钮文案和区域说明文案，保证最小占位界面也具备可读性。
- **acceptance**:
  - 测试可通过 `getByRole`、`getByLabelText` 或 `getByTestId` 稳定定位五区节点。
  - 页面语义不会因为纯 `div` 堆叠而退化为不可读结构。
  - 不引入与后续功能耦合的假交互或虚假状态。
  - 执行 `npm run check` 通过。
- **suggested commit message**: `test(ce-002): stabilize app shell selectors and accessibility hooks`

### Task 5
- **title**: 更新测试基线并固化 CE-002 验收
- **goal**: 让现有测试从计数器示例切换为 App Shell 骨架验证，并确保质量门禁覆盖本 CE 的关键结果。
- **steps**:
  1. 重写 `App` 相关测试，断言五区区域存在、标签可读、占位内容可见。
  2. 覆盖至少一个小屏/滚动相关的低成本断言，例如类名、结构层级、区域属性或样式钩子存在。
  3. 确认 `npm run check` 成为本 CE 的统一验收入口，并记录 `dev server` 的沙箱例外说明。
- **acceptance**:
  - 测试不再依赖计数器示例。
  - 测试覆盖五区结构、测试锚点和基础可访问性要求。
  - `npm run check` 通过即可作为 CE-002 硬验收结果。
- **suggested commit message**: `test(ce-002): cover editor shell layout baseline`
