# 零代码设计器通用画布引擎

## PRD + 技术规格 v3.1（最终定稿）

> 文档定位：本文件是 `canvas_prd.md` 与 `canvas_prd3.0.md` 的最终收口版，合并产品边界、交互规则、数据模型、持久化协议、插件机制与性能约束，作为 P0 开发基线。

| 文档属性 | 内容 |
| --- | --- |
| 文档版本 | v3.1 Final Baseline |
| 文档状态 | 可进入研发排期与实现 |
| 编辑器宿主 | PC Web（Chrome 90+） |
| 目标平台 | 微信小程序 / H5 移动端 |
| 统一技术栈 | React 18 + TypeScript + Zustand + DOM Renderer |
| 核心架构 | Flat Map + Ordered Children + Ghost Layer + Linear History |

---

## 1. 一页结论

### 1.1 项目目标

构建一套运行在 **PC Web** 的通用画布引擎，服务于两类目标平台：

- 微信小程序页面
- H5 移动端页面

编辑器负责：拖拽、布局、属性编辑、预览、历史记录、Schema 导入导出。  
最终产物不是页面代码，而是 **JSON Schema**，由小程序 Runtime 与 H5 Runtime 分别解释执行。

### 1.2 三层运行时模型

1. **Editor Host**：PC 浏览器内运行的设计器本体，可使用 DOM API、右键菜单、键盘事件、Pointer Events、IndexedDB。
2. **Preview Runtime**：
   - H5：支持在编辑器内 iframe 真实预览。
   - 小程序：仅做高保真模拟预览，不等价于微信真实运行时。
3. **Export Runtime**：导出 RuntimeSchema，由各平台自己的 Runtime 解析渲染。

### 1.3 本期最终决断

- 编辑器宿主固定为 **PC Web**。
- 技术栈固定为 **React 18 + Zustand**，不再保留 React/Vue 双栈表述。
- 组件体系统一采用 **Plugin Registry**；内置组件与自定义组件底层同源。
- 节点内容层级唯一真相为 `childrenMap[parentId]` 的顺序；**废弃 `zIndex` 字段**。
- 布局模式是 **容器级属性**，不是全局开关。
- 持久化拆分为 **SavedDocument**（编辑器存档）与 **RuntimeSchema**（运行时导出）两种格式。
- 历史记录采用 **单页独立线性栈**；快照只记录 Schema，不记录设备、视口与选择态。
- 设备预设与目标平台分离：`platform` 负责平台规范，`devicePreset` 负责模拟器外框。
- P0 不做 Git 式分支、多端协作、Canvas/WebGL 渲染、微信真机编译链路。

---

## 2. 范围与边界

### 2.1 P0 范围（必须交付）

- 组件库拖入画布
- 单选 / 多选 / 框选 / 图层面板定位
- 拖拽移动、复制拖拽、容器嵌套落点
- 8 手柄缩放与多选整体缩放
- 自由布局与 Flex 布局容器
- 属性面板编辑
- Group 编组与组内隔离态
- 撤销 / 重做
- 自动保存与恢复
- 平台切换（小程序 / H5）
- 设备预设切换
- H5 iframe 在线预览
- 小程序模拟预览
- Schema 导入 / 导出
- Plugin Registry 与内置组件注册
- 性能降级策略

### 2.2 P1 范围（建议紧随 P0）

- 参考线与磁力参考线
- 平台兼容性检查面板
- 手动命名快照
- 更细粒度的属性校验与提示
- 更丰富的设备预设

### 2.3 Out of Scope

- Git 式版本分支与冲突合并
- 多人实时协作（CRDT / OT）
- Canvas / WebGL 渲染器
- 组件代码导出
- 微信真机编译 / 上传 / 预览链路
- AI 页面生成与 AI 布局建议

---

## 3. 核心架构总表

| 编号 | 主题 | 最终决策 | 备注 |
| --- | --- | --- | --- |
| ADR-01 | 编辑器运行宿主 | PC Web（Chrome 90+） | 目标平台不是编辑器运行环境 |
| ADR-02 | 渲染技术 | React 18 + DOM Renderer | 高频拖拽视觉更新脱离 React render |
| ADR-03 | 状态管理 | Zustand | 使用 transient updates + 订阅分流 |
| ADR-04 | 数据结构 | Flat Map + Ordered Children | `nodes` + `childrenMap` |
| ADR-05 | 节点层级 | 删除 `zIndex` | 唯一层级真相为 children 顺序 |
| ADR-06 | 组件体系 | Plugin Registry | 内置与自定义同源 |
| ADR-07 | 持久化 | SavedDocument + RuntimeSchema | IndexedDB 仅保存编辑器存档 |
| ADR-08 | 历史记录 | 单页线性快照栈 | 快照只存 Schema |
| ADR-09 | 布局模式 | 容器级 `layoutMode` | `free` / `flex` |
| ADR-10 | 预览体系 | H5 真实 iframe；小程序模拟 | 小程序真机链路不属于画布引擎 |
| ADR-11 | 设备体系 | `platform` 与 `devicePreset` 分离 | 一个是规范，一个是外框 |
| ADR-12 | 性能策略 | Ghost Layer + 双轨状态 + 分级降级 | 目标稳定 60fps |

---

## 4. 系统架构

### 4.1 高层结构

```text
Palette / Layers / Inspector / Toolbar
            │
            ▼
      Editor Store (Zustand)
 ┌───────────────────────────────┐
 │ schema / selection / viewport │
 │ history / platform / device   │
 └───────────────────────────────┘
            │
            ├── DOM Renderer（常规渲染）
            ├── Overlay Layer（选中框 / 吸附线 / 标尺）
            ├── Ghost Layer（拖拽视觉轨）
            └── Preview Runtime（H5 iframe / 小程序模拟器）
```

### 4.2 双轨状态模型

- **视觉轨（Fast Track）**：拖拽过程中直接更新 Ghost Layer 或节点 DOM transform，走 `requestAnimationFrame`，不触发 React render。
- **数据轨（Safe Track）**：Zustand 内部静默同步位置与选择信息；拖拽中允许 100ms 节流同步到面板，松手后一次性提交最终值并写历史栈。

### 4.3 Overlay 分层规则

节点内容层与编辑器覆盖层分离：

- **内容层**：由 `childrenMap` 顺序决定层叠关系。
- **覆盖层**：选中框、吸附线、标尺、Ghost Layer、右键菜单使用独立固定 overlay 容器，不参与 Schema，也不受 `childrenMap` 影响。

---

## 5. Store 结构（最终版）

```ts
export type EditorStore = {
  schema: {
    documentId: string
    rootId: string
    nodes: Map<NodeId, NodeModel>
    childrenMap: Map<NodeId, NodeId[]>
  }

  selection: {
    selectedIds: Set<NodeId>
    activeId: NodeId | null
    hoveringId: NodeId | null
    draggingIds: Set<NodeId>
    isolationStack: NodeId[]
  }

  viewport: {
    x: number
    y: number
    zoom: number
  }

  history: {
    stack: Snapshot[]
    cursor: number
  }

  platform: {
    target: 'miniprogram' | 'h5'
    config: PlatformConfig
  }

  device: {
    presetId: string
    width: number
    height: number
    safeArea: { top: number; right: number; bottom: number; left: number }
    defaultFont: string
  }
}
```

### 5.1 状态域解释

- `schema`：画布真实数据源。
- `selection`：选择、悬停、拖拽与隔离态。
- `viewport`：仅控制编辑器视口，不进历史。
- `history`：线性撤销栈，不跨页面共享。
- `platform`：目标平台规则，不等于设备外框。
- `device`：模拟器尺寸、安全区、默认字体等，仅影响编辑与预览。

---

## 6. 数据模型与 Schema 规范

### 6.1 节点模型

```ts
export type NodeModel = {
  id: string
  parentId: string | null
  type: string
  nodeKind: 'page' | 'container' | 'group' | 'leaf'

  name: string
  visible: boolean
  locked: boolean
  platformScope: 'all' | 'miniprogram' | 'h5'

  frame: {
    x: number
    y: number
    width: number
    height: number
  }

  layoutMode?: 'free' | 'flex'

  layout?: {
    direction: 'row' | 'column'
    justifyContent: 'start' | 'center' | 'end' | 'space-between'
    alignItems: 'start' | 'center' | 'end' | 'stretch'
    gap: number
    padding: { top: number; right: number; bottom: number; left: number }
    wrap: 'nowrap' | 'wrap'
  } | null

  flexItem?: {
    grow?: number
    shrink?: number
    basis?: number | 'auto'
    alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch'
  } | null

  style?: Record<string, any>
  props: Record<string, any>

  meta?: {
    pluginId?: string
    componentVersion?: string
    editorOnly?: boolean
    lastFreeFrame?: { x: number; y: number; width: number; height: number }
  }
}
```

### 6.2 字段约束

- `platformScope` 取代旧 `platform` 字段，避免与 Store 的 `platform.target` 混淆。
- `frame` 永远存在；但当父容器为 `flex` 时，`frame.x / frame.y` 不参与最终渲染，只作为缓存与回退依据。
- `nodeKind='group'` 表示编辑期编组；导出时默认打平，除非 Runtime 显式需要保留。
- `style` 存通用视觉属性，`props` 存组件语义属性。
- 节点 Schema **不再包含 `zIndex`**。

### 6.3 childrenMap 规则

```ts
childrenMap: Map<parentId, childIds[]>
```

- 同一父节点下，数组越靠后，渲染层级越高。
- 图层面板上下拖拽、置顶、置底、本质都是数组重排。
- Flex 容器内，`childrenMap` 顺序同时代表视觉顺序与导出顺序。

---

## 7. 持久化协议（最终版）

### 7.1 编辑器存档格式：SavedDocument

用于本地自动保存、服务端存档、重新打开继续编辑。

```ts
export type SavedDocument = {
  version: '1.0.0'
  docId: string
  title: string
  targetPlatform: 'miniprogram' | 'h5'
  schema: RuntimeSchema
  editorState?: {
    activePageId: string
    devicePresetId: string
    viewport: { x: number; y: number; zoom: number }
  }
  meta: {
    createdAt: number
    updatedAt: number
  }
}
```

### 7.2 运行时导出格式：RuntimeSchema

用于 H5 Runtime / 小程序 Runtime 真正消费。

```ts
export type RuntimeSchema = {
  version: '1.0.0'
  rootId: string
  nodes: Record<string, NodeDTO>
  children: Record<string, string[]>
}
```

### 7.3 存储策略

- **内存态**：Map / Set，便于高性能读写。
- **本地自动保存**：IndexedDB。
- **网络传输与导出**：纯 JSON。

### 7.4 自动保存规则

- 文档 dirty 后 **3 秒空闲**触发一次自动保存。
- 若用户持续编辑，则最晚 **30 秒强制落盘**一次。
- 页面刷新 / 关闭前执行 best effort flush。
- 恢复时优先读取最近一份未发布的本地草稿。

### 7.5 历史记录规则

```ts
export type Snapshot = {
  schema: RuntimeSchema
  label: string
  ts: number
}
```

- 每个页面一个线性历史栈。
- 默认最多保留 80 步。
- 进入历史栈的时机：
  - 拖拽 `pointerup`
  - Resize 结束
  - 属性面板 `onBlur` / `Enter`
  - 删除 / 粘贴 / 编组 / 解组 / 图层重排等命令结束
- **不进入历史**：缩放视口、平移视口、平台切换、设备切换、hover、选中变化。

---

## 8. 组件体系：Plugin Registry

### 8.1 注册协议

```ts
registerComponent({
  type: 'button',
  version: '1.0.0',
  render: ButtonRenderer,
  defaults: { width: 120, height: 40, props: { text: '按钮' } },
  inspector: buttonInspectorSchema,
  capabilities: {
    canHaveChildren: false,
    textEditable: true,
    resizable: true,
  },
  platforms: {
    miniprogram: { alias: 'wx-button' },
    h5: { alias: 'button' },
  },
  migrate: (node, fromVersion) => node,
})
```

### 8.2 组件协议字段

| 字段 | 说明 |
| --- | --- |
| `type` | 组件唯一类型名 |
| `version` | 当前组件协议版本 |
| `render` | 编辑器渲染器 |
| `defaults` | 默认尺寸与默认 props |
| `inspector` | 属性面板 Schema |
| `capabilities` | 是否容器、是否支持文本编辑、是否允许缩放等 |
| `platforms` | 平台别名、属性白名单、兼容差异 |
| `migrate` | 文档升级时的节点迁移函数 |

### 8.3 注册规则

- 内置组件与自定义组件 **必须走同一注册入口**。
- 引擎层不硬编码组件字典，只依赖 Registry 查询。
- Registry 初始化失败时，编辑器不得崩溃，需进入只读兜底模式。

### 8.4 缺插件兜底

当文档中存在未注册组件时：

- 画布渲染为 `UnknownComponent` 占位块。
- 保留原始节点数据，不做删除或降级覆盖。
- 图层面板与属性面板展示“缺少插件”的告警信息。
- 文档允许继续打开、移动、导出，但禁止编辑该组件专属属性。

### 8.5 MVP 内置组件

| type | 默认尺寸 | 关键能力 |
| --- | --- | --- |
| `navbar` | 375 × 56 | 顶部导航栏，支持标题与平台差异渲染 |
| `button` | 120 × 40 | 文本编辑、圆角、背景色 |
| `text` | 180 × 28 | 原地文本编辑、字体属性 |
| `image` | 160 × 110 | URL、占位背景、裁剪模式 |
| `input` | 280 × 44 | 占位符、边框、禁用态 |
| `card` | 320 × 150 | 圆角、阴影、背景 |
| `container` | 300 × 180 | 可接收子节点，支持 `free/flex` |
| `tabbar` | 375 × 60 | 底部标签栏配置 |
| `group` | 自适应 | 仅编辑态组合节点 |

---

## 9. 布局模式（最终定案）

### 9.1 容器级 layoutMode

- `free`：子节点绝对定位，`frame.x / frame.y` 为真相。
- `flex`：容器使用 flexbox，子节点顺序与布局属性为真相。

### 9.2 Free → Flex 转换

这是一次 **破坏性重排操作**，必须经过确认。

转换流程：

1. 用户点击“转换为 Flex”。
2. 系统根据子节点几何分布推断默认主轴：
   - 纵向离散度更大 → 默认 `column`
   - 横向离散度更大 → 默认 `row`
3. 弹出轻量确认面板，显示方向与预估 gap，允许用户修改方向并确认。
4. 系统按主轴排序：主轴优先，副轴次之。
5. `gap` 采用相邻节点主轴距离的中位数估算。
6. 默认生成：`justifyContent='start'`，`alignItems='start'`。
7. 原自由布局坐标写入 `meta.lastFreeFrame` 作为回退缓存。

### 9.3 Flex → Free 转换

- 读取当前可视布局的每个子节点 DOM box。
- 相对容器左上角反算 `frame.x / frame.y / width / height`。
- 写回 Schema 后切换为绝对定位。
- 若 DOM box 不可取，则回退使用 `meta.lastFreeFrame`。

### 9.4 Flex 内拖拽规则

- 在 flex 容器内拖拽，不做绝对位移。
- 拖拽中显示 **插入线 / 插入占位**。
- 松手后只更新 `childrenMap` 顺序。
- 若节点被拖出 flex 容器并落到 free 容器，则重新启用绝对坐标。

---

## 10. 交互规范

### 10.1 选择系统

| 操作 | 行为 |
| --- | --- |
| 单击 | 选中目标节点并清空其他选中 |
| Shift + 单击 | 追加或取消目标节点 |
| 空白处拖拽 | 框选所有与选框相交的未锁定节点 |
| Cmd/Ctrl + A | 选中当前页面所有可见且未锁定节点 |
| Esc | 取消选中，若处于组内则先退出隔离态 |

### 10.2 双击优先级

当对节点发生双击时，按以下顺序命中即阻断：

1. `locked` 或 `hidden` 节点：无响应。
2. 多选状态：无响应。
3. 文本类节点（`text` / 含文本的 `button`）：进入原地文本编辑。
4. `group`：进入组内隔离选择模式。
5. `container`：进入深层子节点选择模式。
6. 其他节点：无动作。

### 10.3 编组与隔离态

- `Cmd/Ctrl + G`：对多选节点创建 `group`。
- `Cmd/Ctrl + Shift + G`：取消编组。
- 双击 Group 进入隔离态，`Esc` 返回上一级。
- `selection.isolationStack` 记录当前进入链路。

### 10.4 拖拽规则

#### 从组件库拖入

- 禁用浏览器原生 Drag API。
- 使用全局 Ghost Layer 进行视觉跟随。
- 优先命中最深层可放置容器。
- 放置成功后写入 Schema，并在 `pointerup` 时写历史栈。

#### 画布内移动

- 鼠标移动超过 3px 后视为拖拽。
- `Alt + 拖拽`：复制拖拽；落点生成副本。
- `Shift + 拖拽`：锁定水平或垂直方向。
- 容器内坐标相对于父容器左上角记录。

### 10.5 Resize 规则

- 选中框提供 8 个控制手柄（四角 + 四边）。
- 最小尺寸限制：`10px × 10px`。
- 从左边或上边缩放时，需同步更新 `frame.x / frame.y`。
- `Shift + 拖拽`：锁定初始宽高比。
- `Alt + 拖拽`：以中心点为原点向四周缩放。
- 多选缩放时，以外包围盒为基准整体比例缩放，并重算内部节点的位置与宽高。
- `locked` 或 `hidden` 节点不参与多选缩放。
- 文本类组件允许配置 `height: auto`；若为自动高度，不强制写死缩放后的高度。

### 10.6 属性面板输入规则

所有 Input / ColorPicker 必须维护 `Local Draft State`。

- `onFocus` 期间，同名外部 Store 更新不得强占光标。
- 若外部值已变化，可显示“值已过期”的轻提示，但默认保留本地草稿。
- `onBlur` 或 `Enter` 时提交到全局 Store，并写历史栈。
- `Esc` 取消草稿，回退到 Store 当前值。

### 10.7 对齐与吸附

- 网格吸附：8px 基本网格。
- 节点边缘吸附：左 / 右 / 上 / 下边对齐。
- 节点中心吸附：P0 可做，阈值与边缘吸附一致。
- 默认吸附阈值：5px。
- 多选对齐的基准为当前选中集合的外包围盒。

### 10.8 右键菜单（P0）

#### 节点右键

- 复制
- 剪切
- 原位粘贴
- 编组 / 解组
- 锁定 / 解锁
- 隐藏 / 显示
- 上移一层 / 下移一层 / 置顶 / 置底
- 平台可见性切换
- 在图层面板中定位
- 删除

#### 画布空白右键

- 粘贴
- 全选
- 新建参考线（若启用）
- 清除所有参考线（若启用）

### 10.9 快捷键（P0）

| 快捷键 | 功能 |
| --- | --- |
| Cmd/Ctrl + Z | 撤销 |
| Cmd/Ctrl + Shift + Z | 重做 |
| Delete / Backspace | 删除选中 |
| Cmd/Ctrl + A | 全选 |
| Arrow Keys | 微移 1px |
| Shift + Arrow Keys | 微移 10px |
| Alt + 拖拽 | 复制拖拽 |
| Shift + 拖拽 | 锁定方向或锁定比例 |
| Alt + 拖拽空白区 | 平移画布 |
| Cmd/Ctrl + 滚轮 | 缩放画布 |
| Esc | 取消、退出文本、退出组内、取消拖拽 |

---

## 11. 平台与设备体系

### 11.1 目标平台 Platform

`platform.target` 表示当前导出语义与兼容规则：

- `miniprogram`
- `h5`

平台配置负责：

- 组件别名映射
- 属性白名单与黑名单
- 单位换算（如 px / rpx）
- 不兼容组件与属性提示

### 11.2 设备预设 DevicePreset

设备预设只影响编辑器模拟器外框与预览，不改变导出 Schema 语义。

| 设备型号 | 目标平台 | 画布尺寸 | 状态栏 / 导航栏 | 安全区 | 默认字体 |
| --- | --- | --- | --- | --- | --- |
| 微信小程序-标准 | miniprogram | 375 × 667 | 44px + 胶囊按钮 | 无 | PingFang SC |
| 微信小程序-全面屏 | miniprogram | 390 × 844 | 47px + 胶囊按钮 | 底部 34px | PingFang SC |
| H5 移动端-标准 | h5 | 390 × 844 | 20px 模拟器 | 底部 34px | System |

### 11.3 切换规则

- 切换 `platform.target`：可能触发组件兼容性提示，但 **不进历史**。
- 切换 `devicePreset`：只改变外框尺寸、安全区与参考线，**不进历史**。
- 切换设备后，如容器为 flex，允许因可用宽度变化触发自动重排；该重排属于预览结果，不直接改写节点内容，除非用户明确提交布局变更。

### 11.4 预览模式

- **编辑模式**：显示选中框、标尺、参考线、命中高亮。
- **预览模式**：隐藏辅助元素。
  - H5：走 iframe 真实 Runtime。
  - 小程序：走编辑器内模拟 Runtime。

---

## 12. 性能指标与降级策略

### 12.1 验收指标

| 指标项 | 最低可接受（Must） | 目标值（Target） | 测量场景 |
| --- | --- | --- | --- |
| 拖拽帧率 | ≥ 40fps | 稳定 60fps | 500 节点连续拖拽 |
| 单帧拖拽 JS 预算 | < 8ms | < 4ms | pointermove 到 rAF 内 JS 执行完成 |
| 输入到已绘制帧延迟 | < 16ms | < 8ms | 输入事件到下一帧完成绘制 |
| Schema 恢复 | < 300ms | < 150ms | 100 节点文档冷启动 |
| 撤销 / 重做 | < 32ms | < 16ms | 80 步历史跳转 |
| 平台 / 设备切换 | < 150ms | < 100ms | 200 节点切换平台或设备 |

### 12.2 核心实现约束

- 拖拽视觉更新不得依赖 React 重新渲染。
- 使用 `setPointerCapture` 保障高速拖拽不丢事件。
- 所有视觉更新在统一的 `requestAnimationFrame` 批处理内完成。
- 拖拽开始时为目标元素提升合成层，结束后回收。
- 视口外节点不挂载 DOM；折叠容器内部节点可懒渲染。

### 12.3 分级降级策略

当节点数超过阈值时，自动启用性能保护：

#### 节点数 > 200

1. 拖拽过程中关闭 `box-shadow` 与 `backdrop-filter`。
2. 关闭尾迹残影动效。
3. 关闭深层吸附，仅保留顶层边框吸附。
4. `pointerup` 后立即恢复所有视觉特效。

#### 节点数 > 500

1. 顶部展示性能预警条。
2. 强制启用视口裁剪。
3. 折叠容器子树默认懒渲染。
4. 若仍超预算，右侧属性面板采用更保守的订阅刷新频率。

---

## 13. 研发切分与验收建议

### 13.1 实施顺序

#### 阶段 A：基础骨架

- Store 六层结构
- Schema / childrenMap
- Plugin Registry
- 文档加载、保存、恢复
- 设备与平台切换

#### 阶段 B：核心交互

- 单选 / 多选 / 框选
- 拖拽移动 / 复制拖拽 / 容器落点
- Resize
- 图层重排
- Group 隔离态

#### 阶段 C：预览与性能

- H5 iframe 预览
- 小程序模拟预览
- Ghost Layer 与双轨拖拽
- 降级策略与视口裁剪
- 性能监测面板

### 13.2 P0 验收清单

- 可以创建、移动、删除、复制节点。
- 可以导入和导出 SavedDocument / RuntimeSchema。
- 切换平台后组件兼容性展示正确。
- 切换设备预设后外框与安全区变化正确。
- 拖拽 500 节点场景无明显掉帧。
- 线性撤销 / 重做可靠，不出现状态错乱。
- Group 与 Container 交互无冲突。
- Flex 容器插入排序正确。
- 属性面板编辑期间不抢焦点。
- 缺失插件的文档可正常打开并保留数据。

---

## 14. 延后能力（不阻塞开发）

以下能力不作为 P0 启动前置条件：

- 历史可视化时间轴
- 手动命名版本快照
- AI 生成页面 / AI 建议
- 复杂动效体系
- 多人协作
- 版本 diff 对比

---

## 附录 A：SavedDocument 示例

```json
{
  "version": "1.0.0",
  "docId": "doc_1001",
  "title": "首页草稿",
  "targetPlatform": "h5",
  "schema": {
    "version": "1.0.0",
    "rootId": "page_1",
    "nodes": {
      "page_1": {
        "id": "page_1",
        "parentId": null,
        "type": "page",
        "nodeKind": "page",
        "name": "首页",
        "visible": true,
        "locked": false,
        "platformScope": "all",
        "frame": { "x": 0, "y": 0, "width": 390, "height": 844 },
        "layoutMode": "free",
        "props": {}
      }
    },
    "children": {
      "page_1": []
    }
  },
  "editorState": {
    "activePageId": "page_1",
    "devicePresetId": "h5-standard",
    "viewport": { "x": 0, "y": 0, "zoom": 1 }
  },
  "meta": {
    "createdAt": 1710000000000,
    "updatedAt": 1710000000000
  }
}
```

## 附录 B：RuntimeSchema 导出规则

- 删除所有 editor-only 字段。
- 默认打平 Group 节点。
- 仅导出 Runtime 真正需要的节点属性。
- `platformScope` 与目标平台冲突的节点，导出时按平台过滤。
- 设备预设信息默认不进入 RuntimeSchema。

## 附录 C：本文件作为开发基线的含义

本文件已经补齐以下会阻塞开发的关键空白：

- 编辑器宿主边界
- 组件注册协议
- 持久化格式
- Store 六层结构
- 布局模式切换规则
- 层级唯一真相
- 双击优先级
- 输入框本地草稿规则
- 性能指标与降级策略

因此，本文件可作为 **P0 开发与任务拆解的正式基线**。
