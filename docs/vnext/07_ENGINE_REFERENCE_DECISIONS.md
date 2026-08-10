# v0.3 外部工程参考与采用边界

目标不是把成熟库全部装进来，而是明确“借什么、不借什么”。Core Engine 必须保持小、可测试、可迁移。

## 1. boardgame.io — 借架构，不作为当前依赖

值得借：
- Move/Command 作为唯一状态修改入口
- Turn / Phase 概念
- 游戏日志与可重放思维
- View-layer agnostic
- 多人网络可以以后接

暂不采用原因：
- 我们的艺术资产、媒体、机构、长期背包模型更定制；
- 当前核心代码已经很小；
- 不希望为了未来多人提前把单机规则绑到某个网络框架。

结论：**作为设计参照，不装依赖。**

## 2. Colyseus — 多人阶段的优先候选

适合未来：
- authoritative server
- TypeScript / Node.js
- 房间、匹配、断线重连
- 实时与回合制都能覆盖

接入方式：
客户端仍发送同一种 Command；服务器拥有权威 GameState 并调用 Core Engine。Core 不 import Colyseus。

结论：**多人 Alpha 再评估。**

## 3. Dexie / IndexedDB — 持久存档优先候选

适合：
- 浏览器离线存档
- 资产实例、历史记录、多个 Save Slot
- 版本迁移
- 后续可增加同步层

当前 Journey Lab 暂用 localStorage，只是开发预览；正式 v0.3 存档不能把长期资产继续绑在一个 localStorage JSON 上。

结论：**StorageAdapter 第一优先级候选。**

## 4. Zod — Content Pack 的运行时边界

现在 Core 已有 TypeScript 类型和基础 ID/版本检查，但 TypeScript 类型在运行时会消失。

远程 JSON 包正式启用前，应增加 Zod：
- Manifest schema
- Event schema
- Effect union schema
- Asset / Media schema
- Save schema

结论：**远程内容包开放前必须补。**

## 5. Dockview / dnd-kit — UI 自由度参考

### Dockview

适合桌面端真正的“工作站”布局：
- dock / tabs / split / floating panel
- layout serialization
- React / vanilla TS
- touch support

### dnd-kit

适合更轻量的：
- 资产拖拽
- 配装
- 卡片排序
- 触摸 / 鼠标 / 键盘输入

原则：手机端不能要求“必须拖拽”。任何 drag action 都必须有 tap/click 等价操作。

结论：**先保留 Panel API，UI 第二阶段再做 A/B Prototype。**

## 6. Phaser 4 — 未来 2D / 小游戏 Scene 插件

Phaser 适合把某些事件升级成短场景：
- 现场布线
- 运输 / 安装
- 展览空间小游戏
- 可点击地图

规则：Phaser Scene 只产生 Command，不能直接成为真实 GameState 的主人。

结论：**以后作为 Scene Adapter，不作为 Core Engine。**

## 7. Three.js / React Three Fiber — 未来 3D 场域

用于：
- 工作室 / 展览空间 3D 浏览
- 机甲 / 载具查看与配装
- 交互式艺术场景

同样：3D 场景只读取 selectors、发出 Commands；核心规则仍然无 Three.js 依赖。

结论：**3D Prototype 后置。**

## 8. Tauri — Steam 桌面壳候选

Web UI + Core Engine 保持静态前端形态，以后可以放入 Tauri WebView；Steamworks 能力再通过 PlatformAdapter 接入。

结论：**网页版成熟后再做 desktop shell。**

---

# 当前采用矩阵

| 需求 | v0.3 现在 | 下一步 | 后续 |
|---|---|---|---|
| Turn/Command/Effect | 自研 Core | 稳定 API | server 共用 |
| Runtime validation | 基础手写 | Zod | 内容签名/白名单 |
| Web Save | Preview localStorage | Dexie/IndexedDB | Cloud sync |
| Desktop panel | CSS Grid | PanelRegistry | Dockview A/B |
| Drag 配装 | 点击按钮 | dnd-kit 可选 | touch/keyboard 同步 |
| 2D Scene | 无 | Phaser adapter | 事件小游戏 |
| 3D Scene | 无 | Three/R3F adapter | 复杂空间体验 |
| Multiplayer | 无 | Command transport spec | Colyseus candidate |
| Steam | 无 | PlatformAdapter | Tauri + Steamworks |

**总原则：库可以换，GameState / Command / Effect / stable IDs 不能轻易换。**
