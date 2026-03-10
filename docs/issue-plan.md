# Issue Plan

> 本计划来源于 `docs/workflow-plan.md` 的 Issue Drafts，已按 Epic 分组整理为干净 Markdown。

## EPIC-01 工程骨架与宿主基线

### CE-001 初始化工程与目录
- depends-on: 无
- 验收: 本地可启动；Chrome 90+ 可运行；CI 可完成 install + build。
- 测试点: 开发环境启动成功；生产构建成功；基础错误边界可用；CI 安装与构建链路稳定。
- labels: `canvas-engine`, `p0`, `epic-01`, `foundation`, `tooling`

### CE-002 编辑器 App Shell 五区布局
- depends-on: CE-001
- 验收: 五区可见；窗口缩放不破版；空文档可进入编辑器。
- 测试点: 五区布局在常见分辨率下稳定；面板伸缩不遮挡主画布；空态进入编辑器流程可用。
- labels: `canvas-engine`, `p0`, `epic-01`, `shell`, `layout`

### CE-003 文档入口与空白页初始化
- depends-on: CE-001
- 验收: 可创建空白文档；可从本地恢复；初始化包含 root/page 基础节点。
- 测试点: 新建空白文档成功；恢复最近草稿成功；默认文档节点结构合法。
- labels: `canvas-engine`, `p0`, `epic-01`, `document-entry`, `bootstrap`

## EPIC-02 Schema / Store / Persistence

### CE-004 定义核心类型与 DTO
- depends-on: CE-001
- 验收: 类型可覆盖 page/container/group/leaf；含 platformScope、layoutMode、lastFreeFrame 等关键字段。
- 测试点: 核心类型定义完整；关键字段可被类型系统约束；基础 DTO 序列化与反序列化一致。
- labels: `canvas-engine`, `p0`, `epic-02`, `schema`, `types`

### CE-005 实现 nodes / childrenMap 与转换层
- depends-on: CE-004
- 验收: childrenMap 顺序可保真；导入导出不丢字段；非法结构可拦截。
- 测试点: hydrate/dehydrate 往返一致；childrenMap 顺序稳定；非法父子结构与缺失节点被拦截。
- labels: `canvas-engine`, `p0`, `epic-02`, `schema`, `conversion`

### CE-006 落地 EditorStore 六层结构
- depends-on: CE-004
- 验收: viewport 不进历史；platform 与 device 分离；selection 支持 isolationStack。
- 测试点: 六域状态独立更新；viewport 变更不写历史；platform/device 切换互不污染；isolationStack 可维护。
- labels: `canvas-engine`, `p0`, `epic-02`, `store`, `state-management`

### CE-007 自动保存与恢复
- depends-on: CE-005, CE-006
- 验收: 持续编辑时可定期落盘；刷新后优先恢复最近草稿。
- 测试点: 空闲保存与强制落盘生效；关闭前 best-effort flush 可执行；刷新后恢复最新草稿优先。
- labels: `canvas-engine`, `p0`, `epic-02`, `persistence`, `autosave`

### CE-008 线性历史栈
- depends-on: CE-005, CE-006
- 验收: 默认最多 80 步；拖拽结束、Resize 结束、属性提交、删除/粘贴/编组/重排会入栈；平台/设备/视口/hover 不入栈。
- 测试点: undo/redo 线性回放正确；历史上限截断正确；应入栈与不应入栈事件边界清晰。
- labels: `canvas-engine`, `p0`, `epic-02`, `history`, `undo-redo`

## EPIC-03 Plugin Registry 与组件体系

### CE-009 Registry 注册协议与查询 API
- depends-on: CE-004
- 验收: 内置组件与自定义组件走同一入口；引擎层不硬编码组件字典。
- 测试点: register/get/migrate API 可用；内置与扩展组件注册路径一致；重复注册与缺失查询处理明确。
- labels: `canvas-engine`, `p0`, `epic-03`, `registry`, `plugin-system`

### CE-010 UnknownComponent 兜底与只读模式
- depends-on: CE-009
- 验收: 未注册组件可显示占位；保留原始节点数据；可继续打开/移动/导出。
- 测试点: 缺失插件文档可正常打开；占位组件保留原始数据；只读限制不影响基础浏览与导出。
- labels: `canvas-engine`, `p0`, `epic-03`, `registry`, `fallback`

### CE-011 注册 MVP 内置组件
- depends-on: CE-009
- 验收: 上述组件均可从 Palette 创建；container 支持接收子节点；text/button 支持文本编辑能力声明。
- 测试点: 每个 MVP 组件可注册并创建；container 放置子节点成功；文本编辑能力声明可被读取。
- labels: `canvas-engine`, `p0`, `epic-03`, `components`, `mvp`

### CE-012 平台映射与迁移能力
- depends-on: CE-009, CE-011
- 验收: miniprogram / h5 切换时能读取平台配置；组件版本升级不阻塞文档打开。
- 测试点: 平台别名映射正确；属性白名单按平台生效；组件迁移后旧文档仍可打开。
- labels: `canvas-engine`, `p0`, `epic-03`, `platform`, `migration`

## EPIC-04 Renderer / Canvas 基础能力

### CE-013 DOM Renderer 递归渲染
- depends-on: CE-005, CE-009
- 验收: childrenMap 顺序决定层级；不使用 zIndex；page/container/group/leaf 可正常渲染。
- 测试点: 递归渲染顺序与 childrenMap 一致；不同节点类型可挂载；层级关系不依赖 zIndex。
- labels: `canvas-engine`, `p0`, `epic-04`, `renderer`, `canvas`

### CE-014 Overlay Layer 基础能力
- depends-on: CE-013
- 验收: overlay 不写入 Schema；不受 childrenMap 影响；切换编辑/预览可统一隐藏。
- 测试点: overlay 与 schema 数据隔离；命中高亮与选中框可渲染；编辑态与预览态切换隐藏正确。
- labels: `canvas-engine`, `p0`, `epic-04`, `overlay`, `interaction-layer`

### CE-015 Palette / Layers / Inspector 接线
- depends-on: CE-002, CE-006, CE-013
- 验收: 选中节点后 Layers 与 Inspector 联动；空选中时展示空态。
- 测试点: Palette 列表可读；Layers 与 Inspector 响应选中状态；空态展示稳定。
- labels: `canvas-engine`, `p0`, `epic-04`, `palette`, `inspector`

### CE-016 视口、缩放与设备外框基础
- depends-on: CE-006, CE-013
- 验收: viewport 不进历史；设备外框变化不修改 schema 数据。
- 测试点: 平移缩放行为正确；设备外框与安全区正常渲染；视口操作不污染历史与 schema。
- labels: `canvas-engine`, `p0`, `epic-04`, `viewport`, `device-frame`

## EPIC-05 选择 / 拖拽 / Resize / 图层

### CE-017 选择系统
- depends-on: CE-014, CE-015
- 验收: 锁定或隐藏节点不参与选择；组内隔离时 Esc 先退出隔离再清空选中。
- 测试点: 单选、多选、框选、全选可用；锁定/隐藏节点不可选；Esc 行为符合隔离态优先级。
- labels: `canvas-engine`, `p0`, `epic-05`, `selection`, `interaction`

### CE-018 从组件库拖入
- depends-on: CE-011, CE-014, CE-017
- 验收: 禁用原生 Drag API；优先命中最深层可放置容器；pointerup 后写 schema 与 history。
- 测试点: Palette 到 Canvas 拖入链路可用；命中最深层合法容器；提交时写入 schema 与历史。
- labels: `canvas-engine`, `p0`, `epic-05`, `drag-drop`, `palette`

### CE-019 画布内移动与复制拖拽
- depends-on: CE-017, CE-018
- 验收: 移动超过 3px 才进入拖拽；容器内坐标相对父容器记录；松手后统一提交历史。
- 测试点: 拖拽阈值 3px 生效；Alt 复制拖拽与 Shift 锁方向可用；提交历史时机正确。
- labels: `canvas-engine`, `p0`, `epic-05`, `drag-drop`, `move-copy`

### CE-020 Resize 规则实现
- depends-on: CE-017
- 验收: 最小尺寸 10x10；左/上侧缩放会同步 frame.x/y；Shift 锁比例；Alt 中心缩放；多选按外包围盒等比重算。
- 测试点: 八方向手柄缩放正确；最小尺寸限制生效；比例锁定与中心缩放可用；多选缩放结果正确。
- labels: `canvas-engine`, `p0`, `epic-05`, `resize`, `geometry`

### CE-021 图层面板重排
- depends-on: CE-015, CE-017
- 验收: 同父节点下 childrenMap 顺序变化即视图变化；Flex 容器中顺序同时影响视觉与导出顺序。
- 测试点: 图层拖拽重排成功；置顶置底与上下移动可用；Flex 场景下顺序同步影响渲染与导出。
- labels: `canvas-engine`, `p0`, `epic-05`, `layers`, `reorder`

## EPIC-06 Container / Group / LayoutMode

### CE-022 Group / Ungroup / Isolation
- depends-on: CE-017, CE-021
- 验收: Cmd/Ctrl+G 与 Cmd/Ctrl+Shift+G 可用；多选可生成 group；组内编辑路径可追踪。
- 测试点: 编组与解组命令可用；双击进入隔离态成功；Esc 返回路径正确。
- labels: `canvas-engine`, `p0`, `epic-06`, `group`, `isolation`

### CE-023 容器嵌套落点与深层命中
- depends-on: CE-018, CE-019
- 验收: 拖入和移动时都优先命中最深层可放置容器；非法落点有明确反馈。
- 测试点: 深层容器命中正确；嵌套场景放置正确；非法落点反馈清晰且不中断交互。
- labels: `canvas-engine`, `p0`, `epic-06`, `container`, `hit-testing`

### CE-024 Free -> Flex 转换
- depends-on: CE-013, CE-021
- 验收: 转换需确认；切换后以顺序与布局属性为真相；保留 lastFreeFrame 作为回退依据。
- 测试点: 转换确认流程可用；切换到 Flex 后顺序与布局生效；lastFreeFrame 被正确保留。
- labels: `canvas-engine`, `p0`, `epic-06`, `layout-mode`, `free-to-flex`

### CE-025 Flex -> Free 与 Flex 内拖拽
- depends-on: CE-024, CE-021
- 验收: Flex 内拖拽只更新 childrenMap；拖出到 free 容器后恢复绝对坐标；DOM box 不可取时回退到 lastFreeFrame。
- 测试点: Flex 内重排不改绝对坐标；拖出到 free 容器后 frame 正确恢复；回退逻辑在异常场景下生效。
- labels: `canvas-engine`, `p0`, `epic-06`, `layout-mode`, `flex-to-free`

## EPIC-07 属性面板 / 命令系统 / 平台设备 / 导入导出

### CE-026 Inspector Local Draft State
- depends-on: CE-015, CE-017
- 验收: onFocus 期间同名外部更新不抢光标；onBlur/Enter 提交并入历史；Esc 回退草稿。
- 测试点: 输入期间本地草稿优先生效；提交与取消路径正确；外部更新不会打断输入焦点。
- labels: `canvas-engine`, `p0`, `epic-07`, `inspector`, `draft-state`

### CE-027 命令总线与快捷键
- depends-on: CE-017, CE-021, CE-022
- 验收: 删除/粘贴/编组/解组/重排会写历史；右键菜单与快捷键行为一致。
- 测试点: 命令总线统一分发成功；快捷键与右键菜单行为一致；历史写入边界正确。
- labels: `canvas-engine`, `p0`, `epic-07`, `command-bus`, `shortcuts`

### CE-028 平台切换与设备预设
- depends-on: CE-006, CE-012, CE-016
- 验收: platform 与 device 切换均不进历史；平台切换能展示组件兼容提示；设备切换只影响外框/安全区/预览。
- 测试点: 平台切换不污染历史；设备预设切换只影响视图层；兼容性提示在组件差异场景下可见。
- labels: `canvas-engine`, `p0`, `epic-07`, `platform`, `device`

### CE-029 SavedDocument / RuntimeSchema 导入导出
- depends-on: CE-005, CE-008, CE-010, CE-028
- 验收: 可导入/导出 SavedDocument；可导出 RuntimeSchema；缺失插件节点保留原始数据；editor-only 字段不进入 RuntimeSchema。
- 测试点: SavedDocument 导入导出往返一致；RuntimeSchema 导出过滤正确；缺失插件节点数据保留；editor-only 字段被剔除。
- labels: `canvas-engine`, `p0`, `epic-07`, `import-export`, `runtime-schema`

## EPIC-08 预览 / 性能 / 验收

### CE-030 Ghost Layer 与双轨拖拽
- depends-on: CE-014, CE-018, CE-019
- 验收: 拖拽视觉更新不依赖 React 重渲染；使用 setPointerCapture；pointermove 到 rAF 在预算内。
- 测试点: Ghost Layer 跟手流畅；双轨模型下视觉与数据提交解耦；高频 pointermove 经 rAF 节流后稳定。
- labels: `canvas-engine`, `p0`, `epic-08`, `performance`, `ghost-layer`

### CE-031 H5 iframe 真实预览
- depends-on: CE-029, CE-030
- 验收: 预览模式隐藏辅助层；H5 走真实 Runtime；编辑与预览切换稳定。
- 测试点: iframe 预览可加载真实运行时；辅助层在预览态隐藏；编辑与预览切换无状态错乱。
- labels: `canvas-engine`, `p0`, `epic-08`, `preview`, `h5`

### CE-032 小程序模拟预览
- depends-on: CE-029, CE-030
- 验收: 明确为模拟而非真机；平台切换后能正确读取平台别名与属性差异。
- 测试点: 小程序模拟预览可渲染；模拟标识清晰；平台差异属性在切换后生效。
- labels: `canvas-engine`, `p0`, `epic-08`, `preview`, `miniprogram`

### CE-033 视口裁剪与分级降级
- depends-on: CE-013, CE-030
- 验收: >200 时关闭部分视觉特效与深层吸附；>500 时强制视口裁剪、折叠子树懒渲染、显示性能预警条。
- 测试点: 200 节点阈值降级生效；500 节点阈值裁剪与懒渲染生效；性能预警展示正确。
- labels: `canvas-engine`, `p0`, `epic-08`, `performance`, `degradation`

### CE-034 性能监测与 P0 集成验收
- depends-on: CE-031, CE-032, CE-033
- 验收: 500 节点拖拽 >=40fps；100 节点冷启动恢复 <300ms；80 步撤销/重做 <32ms；200 节点平台/设备切换 <150ms。
- 测试点: 性能面板可采集关键指标；拖拽、恢复、撤销重做、平台设备切换基准达标；P0 验收清单可执行。
- labels: `canvas-engine`, `p0`, `epic-08`, `performance`, `acceptance`