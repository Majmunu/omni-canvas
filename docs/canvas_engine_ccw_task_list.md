# 零代码设计器通用画布引擎 P0 任务清单（Jira / 飞书 / CCW 版）

## 使用建议
- 先用 `brainstorm` 对齐边界与风险
- 再用 `workflow-plan` 生成正式计划
- 然后用 `/issue/plan`、`/issue/queue`、`/issue/execute` 推进执行
- 单个 Epic 实施时，用 `workflow-lite-plan` 做细化

## 任务状态建议
- 类型：Epic / Task
- 优先级：P0
- 标签：canvas-engine, p0, editor, runtime-schema

---

## EPIC-01 工程骨架与宿主基线

### CE-001 初始化工程与目录
- 类型：Task
- 优先级：P0
- 依赖：无
- 目标：建立 React 18 + TypeScript + Zustand 工程，完成基础 lint / build / test 配置。
- 输出：主工程、目录约定、环境变量、基础日志与错误边界。
- 验收：本地可启动；Chrome 90+ 可运行；CI 可完成 install + build。

### CE-002 编辑器 App Shell 五区布局
- 类型：Task
- 优先级：P0
- 依赖：CE-001
- 目标：完成 Palette / Canvas / Layers / Inspector / Toolbar 五区布局。
- 输出：主布局骨架、面板伸缩、空态页。
- 验收：五区可见；窗口缩放不破版；空文档可进入编辑器。

### CE-003 文档入口与空白页初始化
- 类型：Task
- 优先级：P0
- 依赖：CE-001
- 目标：支持新建空白文档、打开现有文档、恢复最近草稿。
- 输出：new/open/recover 入口，默认 page 节点初始化。
- 验收：可创建空白文档；可从本地恢复；初始化包含 root/page 基础节点。

---

## EPIC-02 Schema / Store / Persistence

### CE-004 定义核心类型与 DTO
- 类型：Task
- 优先级：P0
- 依赖：CE-001
- 目标：定义 NodeModel、RuntimeSchema、SavedDocument、Snapshot 等核心类型。
- 输出：类型文件、版本号策略、DTO 约束。
- 验收：类型可覆盖 page/container/group/leaf；含 platformScope、layoutMode、lastFreeFrame 等关键字段。

### CE-005 实现 nodes / childrenMap 与转换层
- 类型：Task
- 优先级：P0
- 依赖：CE-004
- 目标：实现内存态 Map / Set 与 JSON DTO 的双向转换。
- 输出：hydrate / dehydrate / validate API。
- 验收：childrenMap 顺序可保真；导入导出不丢字段；非法结构可拦截。

### CE-006 落地 EditorStore 六层结构
- 类型：Task
- 优先级：P0
- 依赖：CE-004
- 目标：实现 schema / selection / viewport / history / platform / device 六域 Store。
- 输出：zustand store、selectors、actions。
- 验收：viewport 不进历史；platform 与 device 分离；selection 支持 isolationStack。

### CE-007 自动保存与恢复
- 类型：Task
- 优先级：P0
- 依赖：CE-005, CE-006
- 目标：实现 IndexedDB 自动保存、恢复与 best-effort flush。
- 输出：dirty 标记、3 秒空闲保存、30 秒强制落盘、关闭前 flush。
- 验收：持续编辑时可定期落盘；刷新后优先恢复最近草稿。

### CE-008 线性历史栈
- 类型：Task
- 优先级：P0
- 依赖：CE-005, CE-006
- 目标：实现单页线性历史栈与快照提交规则。
- 输出：undo / redo / pushSnapshot API。
- 验收：默认最多 80 步；拖拽结束、Resize 结束、属性提交、删除/粘贴/编组/重排会入栈；平台/设备/视口/hover 不入栈。

---

## EPIC-03 Plugin Registry 与组件体系

### CE-009 Registry 注册协议与查询 API
- 类型：Task
- 优先级：P0
- 依赖：CE-004
- 目标：实现统一的 registerComponent / getComponent / migrate API。
- 输出：registry service、组件协议定义。
- 验收：内置组件与自定义组件走同一入口；引擎层不硬编码组件字典。

### CE-010 UnknownComponent 兜底与只读模式
- 类型：Task
- 优先级：P0
- 依赖：CE-009
- 目标：处理文档缺失插件场景，保证文档可打开。
- 输出：UnknownComponent、缺失插件告警、只读限制。
- 验收：未注册组件可显示占位；保留原始节点数据；可继续打开/移动/导出。

### CE-011 注册 MVP 内置组件
- 类型：Task
- 优先级：P0
- 依赖：CE-009
- 目标：完成 navbar/button/text/image/input/card/container/tabbar/group 的注册。
- 输出：组件 defaults、render、inspector schema、capabilities。
- 验收：上述组件均可从 Palette 创建；container 支持接收子节点；text/button 支持文本编辑能力声明。

### CE-012 平台映射与迁移能力
- 类型：Task
- 优先级：P0
- 依赖：CE-009, CE-011
- 目标：实现平台别名映射、属性白名单、migrate 协议。
- 输出：component platforms 配置与版本迁移接口。
- 验收：miniprogram / h5 切换时能读取平台配置；组件版本升级不阻塞文档打开。

---

## EPIC-04 Renderer / Canvas 基础能力

### CE-013 DOM Renderer 递归渲染
- 类型：Task
- 优先级：P0
- 依赖：CE-005, CE-009
- 目标：实现基于 nodes + childrenMap 的递归渲染。
- 输出：内容层 renderer、节点挂载/卸载、页面根节点渲染。
- 验收：childrenMap 顺序决定层级；不使用 zIndex；page/container/group/leaf 可正常渲染。

### CE-014 Overlay Layer 基础能力
- 类型：Task
- 优先级：P0
- 依赖：CE-013
- 目标：建立独立 overlay 容器，承载选中框、命中高亮、右键菜单等。
- 输出：overlay root、命中高亮、选中框占位。
- 验收：overlay 不写入 Schema；不受 childrenMap 影响；切换编辑/预览可统一隐藏。

### CE-015 Palette / Layers / Inspector 接线
- 类型：Task
- 优先级：P0
- 依赖：CE-002, CE-006, CE-013
- 目标：将左侧组件库、右侧图层/属性面板与 Store 连通。
- 输出：Palette 列表、Layers 列表、Inspector 占位渲染。
- 验收：选中节点后 Layers 与 Inspector 联动；空选中时展示空态。

### CE-016 视口、缩放与设备外框基础
- 类型：Task
- 优先级：P0
- 依赖：CE-006, CE-013
- 目标：实现 viewport 平移/缩放、设备外框、安全区渲染。
- 输出：zoom/pan、device frame、safe area overlay。
- 验收：viewport 不进历史；设备外框变化不修改 schema 数据。

---

## EPIC-05 选择 / 拖拽 / Resize / 图层

### CE-017 选择系统
- 类型：Task
- 优先级：P0
- 依赖：CE-014, CE-015
- 目标：实现单选、多选、框选、全选、Esc 退出。
- 输出：click / shift-click / marquee / Ctrl+A / Esc。
- 验收：锁定或隐藏节点不参与选择；组内隔离时 Esc 先退出隔离再清空选中。

### CE-018 从组件库拖入
- 类型：Task
- 优先级：P0
- 依赖：CE-011, CE-014, CE-017
- 目标：实现 Palette -> Canvas 拖入。
- 输出：ghost 跟随、容器落点判定、节点创建。
- 验收：禁用原生 Drag API；优先命中最深层可放置容器；pointerup 后写 schema 与 history。

### CE-019 画布内移动与复制拖拽
- 类型：Task
- 优先级：P0
- 依赖：CE-017, CE-018
- 目标：实现节点移动、Alt 复制拖拽、Shift 锁方向。
- 输出：drag controller、copy-on-drag、axis lock。
- 验收：移动超过 3px 才进入拖拽；容器内坐标相对父容器记录；松手后统一提交历史。

### CE-020 Resize 规则实现
- 类型：Task
- 优先级：P0
- 依赖：CE-017
- 目标：实现 8 手柄缩放与多选整体缩放。
- 输出：resize handles、bbox scaling、最小尺寸限制。
- 验收：最小尺寸 10x10；左/上侧缩放会同步 frame.x/y；Shift 锁比例；Alt 中心缩放；多选按外包围盒等比重算。

### CE-021 图层面板重排
- 类型：Task
- 优先级：P0
- 依赖：CE-015, CE-017
- 目标：实现图层拖拽重排、置顶、置底、上移、下移。
- 输出：childrenMap reorder API、layer commands。
- 验收：同父节点下 childrenMap 顺序变化即视图变化；Flex 容器中顺序同时影响视觉与导出顺序。

---

## EPIC-06 Container / Group / LayoutMode

### CE-022 Group / Ungroup / Isolation
- 类型：Task
- 优先级：P0
- 依赖：CE-017, CE-021
- 目标：实现编组、解组、双击进入隔离态、Esc 返回。
- 输出：group command、ungroup command、isolationStack 协议。
- 验收：Cmd/Ctrl+G 与 Cmd/Ctrl+Shift+G 可用；多选可生成 group；组内编辑路径可追踪。

### CE-023 容器嵌套落点与深层命中
- 类型：Task
- 优先级：P0
- 依赖：CE-018, CE-019
- 目标：支持最深层容器命中与嵌套容器放置。
- 输出：drop hit-test、容器高亮、合法落点过滤。
- 验收：拖入和移动时都优先命中最深层可放置容器；非法落点有明确反馈。

### CE-024 Free -> Flex 转换
- 类型：Task
- 优先级：P0
- 依赖：CE-013, CE-021
- 目标：实现容器从自由布局切换到 Flex 布局。
- 输出：确认流程、重排计算、layout 写回。
- 验收：转换需确认；切换后以顺序与布局属性为真相；保留 lastFreeFrame 作为回退依据。

### CE-025 Flex -> Free 与 Flex 内拖拽
- 类型：Task
- 优先级：P0
- 依赖：CE-024, CE-021
- 目标：实现 Flex -> Free 回退，以及 Flex 容器内插入排序。
- 输出：DOM box 反算 frame、插入线/占位、reorder only。
- 验收：Flex 内拖拽只更新 childrenMap；拖出到 free 容器后恢复绝对坐标；DOM box 不可取时回退到 lastFreeFrame。

---

## EPIC-07 属性面板 / 命令系统 / 平台设备 / 导入导出

### CE-026 Inspector Local Draft State
- 类型：Task
- 优先级：P0
- 依赖：CE-015, CE-017
- 目标：实现属性输入项本地草稿态，避免编辑时被外部状态抢焦点。
- 输出：draft store、stale hint、commit/cancel 规则。
- 验收：onFocus 期间同名外部更新不抢光标；onBlur/Enter 提交并入历史；Esc 回退草稿。

### CE-027 命令总线与快捷键
- 类型：Task
- 优先级：P0
- 依赖：CE-017, CE-021, CE-022
- 目标：统一删除、复制、粘贴、重复、右键菜单、快捷键命令入口。
- 输出：command bus、context menu、shortcut map。
- 验收：删除/粘贴/编组/解组/重排会写历史；右键菜单与快捷键行为一致。

### CE-028 平台切换与设备预设
- 类型：Task
- 优先级：P0
- 依赖：CE-006, CE-012, CE-016
- 目标：实现 miniprogram / h5 平台切换与设备预设切换。
- 输出：platform/device switcher、兼容性提示、外框更新。
- 验收：platform 与 device 切换均不进历史；平台切换能展示组件兼容提示；设备切换只影响外框/安全区/预览。

### CE-029 SavedDocument / RuntimeSchema 导入导出
- 类型：Task
- 优先级：P0
- 依赖：CE-005, CE-008, CE-010, CE-028
- 目标：实现编辑器存档导入导出与运行时 schema 导出。
- 输出：导入校验、导出过滤、group 打平、platformScope 过滤。
- 验收：可导入/导出 SavedDocument；可导出 RuntimeSchema；缺失插件节点保留原始数据；editor-only 字段不进入 RuntimeSchema。

---

## EPIC-08 预览 / 性能 / 验收

### CE-030 Ghost Layer 与双轨拖拽
- 类型：Task
- 优先级：P0
- 依赖：CE-014, CE-018, CE-019
- 目标：实现 Fast Track / Safe Track 双轨模型。
- 输出：ghost layer、rAF 批处理、静默同步节流。
- 验收：拖拽视觉更新不依赖 React 重渲染；使用 setPointerCapture；pointermove 到 rAF 在预算内。

### CE-031 H5 iframe 真实预览
- 类型：Task
- 优先级：P0
- 依赖：CE-029, CE-030
- 目标：实现编辑器内 H5 Runtime iframe 预览。
- 输出：preview mode、iframe bridge、schema sync。
- 验收：预览模式隐藏辅助层；H5 走真实 Runtime；编辑与预览切换稳定。

### CE-032 小程序模拟预览
- 类型：Task
- 优先级：P0
- 依赖：CE-029, CE-030
- 目标：实现编辑器内小程序高保真模拟预览。
- 输出：mini-program simulator、平台差异渲染。
- 验收：明确为模拟而非真机；平台切换后能正确读取平台别名与属性差异。

### CE-033 视口裁剪与分级降级
- 类型：Task
- 优先级：P0
- 依赖：CE-013, CE-030
- 目标：实现节点数 >200 / >500 的性能保护。
- 输出：virtualized mount、lazy render、degrade switches。
- 验收：>200 时关闭部分视觉特效与深层吸附；>500 时强制视口裁剪、折叠子树懒渲染、显示性能预警条。

### CE-034 性能监测与 P0 集成验收
- 类型：Task
- 优先级：P0
- 依赖：CE-031, CE-032, CE-033
- 目标：建立性能指标面板与 P0 验收套件。
- 输出：fps/js budget/undo/restore/platform-device switch benchmark、验收 checklist。
- 验收：500 节点拖拽 >=40fps；100 节点冷启动恢复 <300ms；80 步撤销/重做 <32ms；200 节点平台/设备切换 <150ms。

---

## 最小可运行闭环（建议先做）
CE-001 -> CE-004 -> CE-005 -> CE-006 -> CE-009 -> CE-011 -> CE-013 -> CE-014 -> CE-017 -> CE-018 -> CE-019 -> CE-026 -> CE-029 -> CE-030 -> CE-031 -> CE-034

## 并行建议
- CE-004 / CE-009 / CE-002 可在 CE-001 后并行
- CE-013 与 CE-015 可在 CE-005 + CE-009 后并行
- CE-020 / CE-021 / CE-022 可在 CE-017 后拆给不同人
- CE-031 / CE-032 可在 CE-029 + CE-030 后并行

## 可直接喂给 CCW 的提示词

### 1) 先对齐整体规划
`brainstorm "基于以下 P0 Backlog，按架构、交互、性能、测试、项目管理五个视角检查边界、依赖与风险，输出建议的最小闭环和并行策略。"`

### 2) 生成正式研发计划
`workflow-plan "将以下零代码设计器通用画布引擎 P0 Backlog 转成研发计划。要求输出里程碑、Epic 依赖、关键风险、建议先做的 spike、每周推进节奏。"`

### 3) 把 backlog 转成 issue 计划
`/issue/plan "根据以下 Backlog 生成 issue 计划，要求按 Epic 分组，并给出每个 issue 的依赖、验收标准与建议负责人角色。"`

### 4) 形成执行队列
`/issue/queue "基于以下 issue 列表，按依赖关系生成最短可运行路径，并给出并行执行建议。"`

### 5) 实施单个 Epic
`workflow-lite-plan "实现 EPIC-05 选择/拖拽/Resize/图层。请拆到可直接编码的任务，并补测试点、状态流和边界条件。"`
