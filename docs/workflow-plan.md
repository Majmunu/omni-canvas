# Workflow Plan

## 1. Planning Guardrails
- P0 主路径以“可创建文档 -> 可渲染 -> 可选择 -> 可拖入/移动 -> 可改属性 -> 可保存/撤销 -> 可导出 -> 可 H5 预览”为最短闭环。
- Stage A 只解决工程骨架、文档模型、注册机制、基础渲染和基础选择，不提前引入复杂布局、性能分级或小程序模拟。
- Stage B 才进入拖拽、属性提交、历史、导入导出、命令、图层、容器与布局模式；前提是 Schema / Store / Registry 已稳定。
- Stage C 聚焦 H5 预览、性能降级、小程序模拟和 P0 集成验收；不把性能优化前置到基础可用性之前。
- 统一以 `nodes + childrenMap` 为数据真相，以 `children` 顺序表达层级；不引入 `zIndex`。
- 历史只记录文档 Schema 变化；不记录 viewport / platform / device / selection。
- 小程序能力在 P0 仅为模拟预览，不阻塞基础编辑、导出和 H5 真实预览。

## 2. Milestones

### Stage A - 基础骨架
- Milestone A1: 工程可启动、编辑器宿主框架成立
  - EPIC-01 工程骨架与宿主基线
- Milestone A2: 文档模型、Store、Registry 稳定
  - EPIC-02 Schema / Store / Persistence（先做 CE-004/005/006）
  - EPIC-03 Plugin Registry 与组件体系（先做 CE-009/010/011）
- Milestone A3: 基础渲染闭环与基础选择成型
  - EPIC-04 Renderer / Canvas 基础能力（先做 CE-013/014/015/016）
  - EPIC-05 选择系统（先做 CE-017）

### Stage B - 核心交互
- Milestone B1: 编辑闭环可用
  - EPIC-05 拖入 / 移动 / Resize / 图层（CE-018/019/020/021）
  - EPIC-07 属性面板 / 命令系统 / 平台设备 / 导入导出（CE-026/027/028/029）
- Milestone B2: 文档可靠性闭环
  - EPIC-02 Schema / Store / Persistence（CE-007/008）
- Milestone B3: 容器与布局模式扩展
  - EPIC-06 Container / Group / LayoutMode（CE-022/023/024/025）

### Stage C - 预览与性能
- Milestone C1: 预览闭环
  - EPIC-08 预览 / 性能 / 验收（先做 CE-030/031）
- Milestone C2: 平台补全与性能保护
  - EPIC-08（CE-032/033）
- Milestone C3: P0 集成验收
  - EPIC-08（CE-034）

## 3. Dependency Graph
- EPIC-01 -> EPIC-02, EPIC-04
- EPIC-02(CE-004/005/006) -> EPIC-03, EPIC-04, EPIC-07, EPIC-08
- EPIC-03(CE-009/011) -> EPIC-04(CE-013), EPIC-05(CE-018), EPIC-07(CE-028/029)
- EPIC-04(CE-013/014/015) -> EPIC-05, EPIC-07(CE-026)
- EPIC-05(CE-017) -> CE-018/019/020/021/022/027
- CE-018/019 -> CE-023, CE-030
- CE-021 -> CE-022/024/025/027
- CE-026 + CE-008 + CE-028 -> CE-029
- CE-029 + CE-030 -> CE-031
- CE-031 完成后，CE-032 可作为补充平台预览能力推进
- CE-030 -> CE-033
- CE-031 + CE-032 + CE-033 -> CE-034

## 4. Shortest Runnable Path
- 最短可运行路径：
  `CE-001 -> CE-002 -> CE-003 -> CE-004 -> CE-005 -> CE-006 -> CE-009 -> CE-011 -> CE-013 -> CE-014 -> CE-015 -> CE-017 -> CE-018 -> CE-019 -> CE-026 -> CE-008 -> CE-028 -> CE-029 -> CE-030 -> CE-031`
- 该路径产出能力：
  - 可进入编辑器并创建空白文档
  - 可注册并渲染内置组件
  - 可进行基础选择、拖入、移动
  - 可通过 Inspector 提交属性
  - 可撤销/重做核心编辑动作
  - 可导出 SavedDocument / RuntimeSchema
  - 可在编辑器内完成 H5 真实预览

## 5. Parallelization Plan
- Wave A
  - 可并行：CE-002, CE-004, CE-009
  - 前提：CE-001
- Wave B
  - 可并行：CE-003, CE-005, CE-006, CE-011
  - 前提：分别满足 CE-001 / CE-004 / CE-009
- Wave C
  - 可并行：CE-013, CE-015, CE-016, CE-010
  - 前提：Renderer 线依赖 CE-005 + CE-009；面板接线依赖 CE-002 + CE-006 + CE-013
- Wave D
  - 可并行：CE-017, CE-007, CE-008, CE-012
  - 前提：选择依赖 CE-014 + CE-015；持久化与历史依赖 CE-005 + CE-006
- Wave E
  - 可并行：CE-018, CE-020, CE-021, CE-026, CE-028
  - 前提：分别满足 CE-017 / CE-015 / CE-006 + CE-012 + CE-016
- Wave F
  - 可并行：CE-019, CE-022, CE-024, CE-027
  - 前提：分别满足前置交互与图层能力
- Wave G
  - 可并行：CE-023, CE-025, CE-029
  - 前提：容器命中、布局转换、导入导出能力已具备
- Wave H
  - 可并行：CE-030, CE-032, CE-033
  - 前提：双轨拖拽依赖基础拖拽；小程序模拟必须晚于 CE-029；性能降级晚于可用性闭环
- Wave I
  - 可并行：CE-031
  - 前提：CE-029 + CE-030
- Wave J
  - 可并行：CE-034
  - 前提：CE-031 + CE-032 + CE-033

## 6. Issue Drafts for /issue/plan

### [CE-001] 初始化工程与目录
- Epic: EPIC-01 工程骨架与宿主基线
- Stage: Stage A
- Depends on: 无
- Goal: 建立 React 18 + TypeScript + Zustand 的编辑器工程基线
- Scope: Vite 工程、目录分层、Lint/Test/Build、错误边界、基础脚本
- Deliverables: 可运行工程、目录约定、质量脚本、基础宿主入口
- Acceptance Criteria: `dev/build/test` 可执行；Chrome 90+ 可启动；存在编辑器根入口
- Test Points: 启动烟测；生产构建；空白页面渲染；错误边界回退
- Out of Scope: 编辑器交互、Schema 设计

### [CE-002] 编辑器 App Shell 五区布局
- Epic: EPIC-01 工程骨架与宿主基线
- Stage: Stage A
- Depends on: CE-001
- Goal: 建立 Palette / Canvas / Layers / Inspector / Toolbar 五区壳层
- Scope: 主布局、伸缩区、空态占位、响应式最小宽高策略
- Deliverables: App Shell、五区骨架、面板占位
- Acceptance Criteria: 五区可见；窗口缩放不破版；空文档可进入编辑器
- Test Points: 布局快照；窗口 resize；面板折叠展开；空态显示
- Out of Scope: 真实业务接线

### [CE-003] 文档入口与空白页初始化
- Epic: EPIC-01 工程骨架与宿主基线
- Stage: Stage A
- Depends on: CE-001
- Goal: 让编辑器可新建空白文档并进入默认页面
- Scope: new/open/recover 入口、默认 root/page 初始化
- Deliverables: 文档入口流、空白文档创建器
- Acceptance Criteria: 能创建空白文档；初始化包含 root/page；可进入编辑界面
- Test Points: 新建文档；空白恢复；非法文档入口容错
- Out of Scope: 持久化细节、复杂文档管理

### [CE-004] 定义核心类型与 DTO
- Epic: EPIC-02 Schema / Store / Persistence
- Stage: Stage A
- Depends on: CE-001
- Goal: 固化 P0 核心类型、DTO 和版本边界
- Scope: NodeModel、SavedDocument、RuntimeSchema、Snapshot、平台/设备 DTO
- Deliverables: 类型定义、约束注释、版本字段
- Acceptance Criteria: 覆盖 page/container/group/leaf；包含 platformScope/layoutMode/lastFreeFrame；无 zIndex
- Test Points: 类型编译；示例 DTO 通过；非法字段报错
- Out of Scope: 转换实现、业务逻辑

### [CE-005] 实现 nodes / childrenMap 与转换层
- Epic: EPIC-02 Schema / Store / Persistence
- Stage: Stage A
- Depends on: CE-004
- Goal: 建立内存态与持久化 DTO 的双向转换
- Scope: hydrate/dehydrate/validate、结构校验、顺序保真
- Deliverables: 转换 API、校验器、错误模型
- Acceptance Criteria: childrenMap 顺序保真；导入导出不丢字段；非法父子关系被拦截
- Test Points: 正常转换；循环引用检测；孤儿节点检测；空 childrenMap
- Out of Scope: 自动保存、导入导出 UI

### [CE-006] 落地 EditorStore 六层结构
- Epic: EPIC-02 Schema / Store / Persistence
- Stage: Stage A
- Depends on: CE-004
- Goal: 建立编辑器统一 Store 边界
- Scope: schema/selection/viewport/history/platform/device 六域、actions、selectors
- Deliverables: Zustand Store、领域 action、订阅出口
- Acceptance Criteria: 六域分离清晰；viewport 不进历史；platform 与 device 分离
- Test Points: action 单测；selector 稳定性；域间更新边界
- Out of Scope: 复杂交互、持久化落盘

### [CE-007] 自动保存与恢复
- Epic: EPIC-02 Schema / Store / Persistence
- Stage: Stage B
- Depends on: CE-005, CE-006
- Goal: 提供编辑期存档恢复能力
- Scope: IndexedDB、dirty 标记、空闲保存、强制落盘、恢复策略
- Deliverables: autosave 服务、恢复入口接线
- Acceptance Criteria: 持续编辑可定期落盘；刷新后优先恢复最近草稿；失败时不阻塞编辑
- Test Points: 空闲保存；频繁编辑节流；刷新恢复；存储异常降级
- Out of Scope: 云端同步、版本管理

### [CE-008] 线性历史栈
- Epic: EPIC-02 Schema / Store / Persistence
- Stage: Stage B
- Depends on: CE-005, CE-006
- Goal: 实现单页线性撤销/重做
- Scope: pushSnapshot、undo、redo、截断规则、容量上限
- Deliverables: history API、提交规则
- Acceptance Criteria: 默认 80 步；拖拽结束和属性提交入栈；viewport/platform/device/selection 不入栈
- Test Points: 撤销重做顺序；redo 截断；容量淘汰；非历史域不入栈
- Out of Scope: 多页历史、协作冲突

### [CE-009] Registry 注册协议与查询 API
- Epic: EPIC-03 Plugin Registry 与组件体系
- Stage: Stage A
- Depends on: CE-004
- Goal: 建立组件注册统一协议
- Scope: register/get/list/migrate 协议、组件元数据、能力声明
- Deliverables: registry service、查询 API、协议类型
- Acceptance Criteria: 内置与自定义同入口；引擎不硬编码组件字典
- Test Points: 重复注册；缺失查询；协议类型约束；迁移钩子调用
- Out of Scope: 组件具体实现

### [CE-010] UnknownComponent 兜底
- Epic: EPIC-03 Plugin Registry 与组件体系
- Stage: Stage A
- Depends on: CE-009
- Goal: 缺失组件时仍可打开文档
- Scope: 占位渲染、只读限制、告警信息、原始数据保留
- Deliverables: UnknownComponent、缺失插件策略
- Acceptance Criteria: 未注册节点可显示；原始节点数据保留；文档可导出
- Test Points: 缺失插件打开；导出保真；交互禁用边界
- Out of Scope: 自动安装插件

### [CE-011] 注册 MVP 内置组件
- Epic: EPIC-03 Plugin Registry 与组件体系
- Stage: Stage A
- Depends on: CE-009
- Goal: 提供最小可编辑组件集
- Scope: navbar/button/text/image/input/card/container/tabbar/group
- Deliverables: 组件 defaults、render、inspector schema、capabilities
- Acceptance Criteria: 组件可从 Palette 创建；container 可接收子节点；基础属性可读
- Test Points: 注册完整性；默认值生成；渲染烟测；容器能力声明
- Out of Scope: 高级组件库

### [CE-012] 平台映射与迁移能力
- Epic: EPIC-03 Plugin Registry 与组件体系
- Stage: Stage B
- Depends on: CE-009, CE-011
- Goal: 支撑多平台组件映射与版本迁移
- Scope: platform config、属性白名单、migrate 协议
- Deliverables: 平台映射器、迁移入口
- Acceptance Criteria: H5/小程序切换可读取平台配置；旧版本组件可迁移打开
- Test Points: 平台别名读取；迁移成功/失败；白名单过滤
- Out of Scope: 真机平台适配

### [CE-013] DOM Renderer 递归渲染
- Epic: EPIC-04 Renderer / Canvas 基础能力
- Stage: Stage A
- Depends on: CE-005, CE-009
- Goal: 建立基于 nodes + childrenMap 的内容层渲染闭环
- Scope: 页面根节点、递归渲染、挂载卸载、容器与叶子节点渲染
- Deliverables: Renderer、节点渲染协议适配
- Acceptance Criteria: childrenMap 顺序即层级；不使用 zIndex；page/container/group/leaf 正常渲染
- Test Points: 渲染树快照；重排后顺序变化；节点删除卸载
- Out of Scope: Overlay、拖拽性能优化

### [CE-014] Overlay Layer 基础能力
- Epic: EPIC-04 Renderer / Canvas 基础能力
- Stage: Stage A
- Depends on: CE-013
- Goal: 建立不入 Schema 的编辑覆盖层
- Scope: overlay root、命中高亮、选中框占位、隐藏策略
- Deliverables: Overlay 容器、基础 overlay primitives
- Acceptance Criteria: Overlay 不入 Schema；不受 childrenMap 影响；预览模式可统一隐藏
- Test Points: overlay 挂载；模式切换；与内容层层级隔离
- Out of Scope: Ghost Layer、复杂辅助线

### [CE-015] Palette / Layers / Inspector 接线
- Epic: EPIC-04 Renderer / Canvas 基础能力
- Stage: Stage A
- Depends on: CE-002, CE-006, CE-013
- Goal: 打通壳层面板与 Store/Renderer
- Scope: Palette 列表、Layers 列表、Inspector 占位联动
- Deliverables: 三大面板接线、空态联动
- Acceptance Criteria: 选中节点后三方联动；空选中展示空态；组件列表可见
- Test Points: 面板联动；空态切换；列表渲染稳定性
- Out of Scope: Inspector 提交逻辑、图层重排

### [CE-016] 视口 / 缩放 / 设备外框
- Epic: EPIC-04 Renderer / Canvas 基础能力
- Stage: Stage A
- Depends on: CE-006, CE-013
- Goal: 提供编辑器视口与设备框基础能力
- Scope: pan/zoom、device frame、安全区显示
- Deliverables: viewport controller、device chrome
- Acceptance Criteria: 视口变化不进历史；设备外框变化不修改 schema
- Test Points: 缩放边界；平移；安全区显示；历史隔离
- Out of Scope: 平台切换策略

### [CE-017] 选择系统
- Epic: EPIC-05 选择 / 拖拽 / Resize / 图层
- Stage: Stage A
- Depends on: CE-014, CE-015
- Goal: 建立基础选择闭环
- Scope: 单选、多选、框选、全选、Esc 退出
- Deliverables: selection controller、命中规则
- Acceptance Criteria: 锁定/隐藏节点不可选；隔离态下 Esc 先退隔离再清空
- Test Points: click/shift-click；marquee；Ctrl+A；隐藏锁定节点
- Out of Scope: 拖拽、缩放

### [CE-018] 从组件库拖入
- Epic: EPIC-05 选择 / 拖拽 / Resize / 图层
- Stage: Stage B
- Depends on: CE-011, CE-014, CE-017
- Goal: 支持 Palette -> Canvas 创建节点
- Scope: 自定义 pointer 拖入、容器落点、节点创建
- Deliverables: drag-from-palette controller、落点判定
- Acceptance Criteria: 不使用原生 Drag API；命中最深层可放置容器；落下后写 schema 与 history
- Test Points: 根容器拖入；容器内拖入；非法落点；拖入取消
- Out of Scope: 画布内移动、Ghost 双轨

### [CE-019] 画布内移动与复制拖拽
- Epic: EPIC-05 选择 / 拖拽 / Resize / 图层
- Stage: Stage B
- Depends on: CE-017, CE-018
- Goal: 支持节点移动、Alt 复制、Shift 锁方向
- Scope: drag controller、复制逻辑、坐标换算
- Deliverables: move/copy drag 能力
- Acceptance Criteria: 超过 3px 才进入拖拽；容器内坐标相对父容器记录；松手统一入历史
- Test Points: 移动；Alt 复制；Shift 锁方向；拖拽阈值
- Out of Scope: 深层容器命中优化

### [CE-020] Resize 规则实现
- Epic: EPIC-05 选择 / 拖拽 / Resize / 图层
- Stage: Stage B
- Depends on: CE-017
- Goal: 提供 8 手柄缩放能力
- Scope: 单选 resize、多选外包围盒缩放、约束键支持
- Deliverables: resize controller、bbox 计算
- Acceptance Criteria: 最小尺寸 10x10；左/上缩放同步 x/y；支持 Shift 锁比和 Alt 中心缩放
- Test Points: 八方向手柄；最小尺寸；多选缩放；负向拖拽边界
- Out of Scope: Flex 内缩放语义

### [CE-021] 图层面板重排
- Epic: EPIC-05 选择 / 拖拽 / Resize / 图层
- Stage: Stage B
- Depends on: CE-015, CE-017
- Goal: 支持 childrenMap 顺序重排
- Scope: 图层拖拽、置顶置底、上移下移
- Deliverables: reorder API、图层命令
- Acceptance Criteria: 同父节点顺序变化即视图变化；Flex 中顺序同时影响视觉和导出
- Test Points: 同级重排；跨父限制；快捷命令；导出顺序校验
- Out of Scope: 深层容器命中

### [CE-022] Group / Ungroup / Isolation
- Epic: EPIC-06 Container / Group / LayoutMode
- Stage: Stage B
- Depends on: CE-017, CE-021
- Goal: 支持编辑期编组与隔离态
- Scope: 编组、解组、双击入组、Esc 退组
- Deliverables: group commands、isolationStack 协议
- Acceptance Criteria: 快捷键可用；多选可编组；组内编辑路径可追踪
- Test Points: group/ungroup；双击隔离；Esc 退出；历史入栈
- Out of Scope: 导出保留 group 语义

### [CE-023] 容器嵌套落点与深层命中
- Epic: EPIC-06 Container / Group / LayoutMode
- Stage: Stage B
- Depends on: CE-018, CE-019
- Goal: 提升拖拽到复杂容器树时的落点准确性
- Scope: 深层 hit-test、合法落点过滤、容器高亮
- Deliverables: nested hit-test 服务
- Acceptance Criteria: 拖入和移动均优先命中最深层合法容器；非法落点有明确反馈
- Test Points: 多层容器；遮挡命中；非法祖先落点；高亮一致性
- Out of Scope: 自动布局转换

### [CE-024] Free -> Flex 转换
- Epic: EPIC-06 Container / Group / LayoutMode
- Stage: Stage B
- Depends on: CE-013, CE-021
- Goal: 支持容器从自由布局切换到 Flex
- Scope: 转换确认、顺序重排、layout 写回、lastFreeFrame 保留
- Deliverables: layoutMode 转换器
- Acceptance Criteria: 转换需确认；切换后以 children 顺序与 layout 属性为真相；保留回退依据
- Test Points: free 转 flex；空容器；已有子节点顺序保留；历史入栈
- Out of Scope: Flex 内复杂编辑

### [CE-025] Flex -> Free 与 Flex 内拖拽
- Epic: EPIC-06 Container / Group / LayoutMode
- Stage: Stage B
- Depends on: CE-024, CE-021
- Goal: 补全 Flex 回退与 Flex 内排序能力
- Scope: DOM box 反算 frame、插入排序、拖出回退
- Deliverables: flex reorder/drop 逻辑
- Acceptance Criteria: Flex 内拖拽只更新 childrenMap；拖出到 free 时恢复绝对坐标；DOM box 不可取时回退 lastFreeFrame
- Test Points: Flex 内重排；拖出容器；DOM box 缺失回退；多子节点场景
- Out of Scope: Grid 等复杂布局

### [CE-026] Inspector Local Draft State
- Epic: EPIC-07 属性面板 / 命令系统 / 导入导出
- Stage: Stage B
- Depends on: CE-015, CE-017
- Goal: 建立属性编辑的本地草稿态
- Scope: 输入草稿、提交/取消、冲突提示
- Deliverables: draft state、commit 规则、stale hint
- Acceptance Criteria: 编辑期间不抢焦点；onBlur/Enter 提交并入历史；Esc 回退草稿
- Test Points: 文本输入；数值输入；外部更新冲突；失焦提交流程
- Out of Scope: 属性校验高级提示

### [CE-027] 命令总线与快捷键
- Epic: EPIC-07 属性面板 / 命令系统 / 导入导出
- Stage: Stage B
- Depends on: CE-017, CE-021, CE-022
- Goal: 统一命令入口与快捷键行为
- Scope: delete/copy/paste/duplicate/group/menu/shortcut
- Deliverables: command bus、shortcut map、context menu
- Acceptance Criteria: 菜单与快捷键行为一致；会改 Schema 的命令全部写历史
- Test Points: 键盘快捷键；右键菜单；禁用态；焦点冲突
- Out of Scope: 全局命令面板

### [CE-028] 平台切换与设备预设
- Epic: EPIC-07 属性面板 / 命令系统 / 导入导出
- Stage: Stage B
- Depends on: CE-006, CE-012, CE-016
- Goal: 支持平台与设备模拟分离切换
- Scope: platform switcher、device preset、兼容性提示
- Deliverables: 切换器 UI、状态接线、提示机制
- Acceptance Criteria: platform/device 切换均不进历史；设备只影响外框/安全区/预览
- Test Points: 平台切换；设备切换；兼容提示；历史隔离
- Out of Scope: 小程序真机链路

### [CE-029] SavedDocument / RuntimeSchema 导入导出
- Epic: EPIC-07 属性面板 / 命令系统 / 导入导出
- Stage: Stage B
- Depends on: CE-005, CE-008, CE-010, CE-028
- Goal: 完成编辑器存档与运行时 Schema 的双出口
- Scope: 导入校验、导出过滤、group 打平、platformScope 过滤
- Deliverables: import/export service、格式校验器
- Acceptance Criteria: 可导入导出 SavedDocument；可导出 RuntimeSchema；editor-only 字段不进入 RuntimeSchema
- Test Points: 正常导入导出；缺失插件文档；group 打平；平台过滤
- Out of Scope: 页面代码生成

### [CE-030] Ghost Layer 与双轨拖拽
- Epic: EPIC-08 预览 / 性能 / 验收
- Stage: Stage C
- Depends on: CE-014, CE-018, CE-019
- Goal: 将拖拽视觉更新与数据提交解耦
- Scope: Ghost Layer、rAF 调度、静默同步节流、pointer capture
- Deliverables: fast track / safe track 拖拽管线
- Acceptance Criteria: 拖拽视觉更新不依赖 React 重渲染；使用 setPointerCapture；松手后一次提交最终状态
- Test Points: 高频 pointermove；拖拽流畅性；数据一致性；中断恢复
- Out of Scope: 全量性能优化

### [CE-031] H5 iframe 真实预览
- Epic: EPIC-08 预览 / 性能 / 验收
- Stage: Stage C
- Depends on: CE-029, CE-030
- Goal: 建立编辑器内 H5 真实预览
- Scope: preview mode、iframe bridge、schema sync、辅助层隐藏
- Deliverables: H5 preview runtime 接线
- Acceptance Criteria: 预览模式隐藏 overlay；H5 使用真实 Runtime；编辑/预览切换稳定
- Test Points: 模式切换；schema 同步；设备外框协同；异常 iframe 容错
- Out of Scope: 小程序模拟

### [CE-032] 小程序模拟预览
- Epic: EPIC-08 预览 / 性能 / 验收
- Stage: Stage C
- Depends on: CE-029, CE-031
- Goal: 提供小程序高保真模拟预览
- Scope: 模拟 runtime、平台差异渲染、说明文案
- Deliverables: mini-program simulator
- Acceptance Criteria: 明确标识为模拟；能读取平台别名与属性差异；不阻塞 H5 预览主路径
- Test Points: 平台切换；模拟差异渲染；与导出 Schema 一致性
- Out of Scope: 微信真机编译/上传

### [CE-033] 视口裁剪与分级降级
- Epic: EPIC-08 预览 / 性能 / 验收
- Stage: Stage C
- Depends on: CE-013, CE-030
- Goal: 在大节点量场景提供性能保护
- Scope: >200 与 >500 节点降级阈值、视口裁剪、懒渲染、预警
- Deliverables: degrade switches、performance guard
- Acceptance Criteria: >200 关闭部分视觉特效；>500 强制视口裁剪与懒渲染；有性能预警
- Test Points: 200/500 阈值切换；裁剪正确性；降级回退；交互不中断
- Out of Scope: 通用虚拟列表基础设施

### [CE-034] 性能监测与 P0 集成验收
- Epic: EPIC-08 预览 / 性能 / 验收
- Stage: Stage C
- Depends on: CE-031, CE-032, CE-033
- Goal: 建立 P0 验收门槛和基准面板
- Scope: fps/js budget/undo/restore/switch benchmark、验收 checklist
- Deliverables: 性能监测面板、P0 集成验收用例
- Acceptance Criteria: 500 节点拖拽 >=40fps；100 节点冷启动恢复 <300ms；80 步撤销/重做 <32ms；200 节点平台/设备切换 <150ms
- Test Points: 基准脚本；端到端验收；回归基线；异常指标告警
- Out of Scope: 长期性能平台化建设

## 7. Planning Self-Check
- 已检查“复杂布局系统是否排在基础编辑闭环之前”：未违反。`CE-022~025` 全部放在 Stage B，晚于渲染、选择、拖拽、属性、导出主路径。
- 已检查“性能优化是否排在基础可用性之前”：未违反。`CE-030/033/034` 均在 Stage C，且 `CE-030` 仅在基础拖拽可用后做为体验增强。
- 已检查“小程序模拟预览是否排在基础导出和 H5 预览之前”：已修正为 `CE-032` 依赖 `CE-031`，明确晚于 `CE-029` 和 H5 真实预览。
- 已检查“Schema / Store 稳定前是否推进复杂交互”：未违反。所有复杂交互均依赖 `CE-004/005/006`。
- 已检查“是否优先保证最小可运行闭环”：已满足。最短路径聚焦工程骨架、Schema/Store、Registry、Renderer、Selection、DnD、Inspector、History、Export、H5 Preview。