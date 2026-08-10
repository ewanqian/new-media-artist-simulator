# v0.3 Core Engine：Web First / Steam Ready

## 1. 最终技术形态

```text
                    CONTENT PACKS
 events / assets / factions / media / projects
                         │
                         ▼
┌──────────────────────────────────────────────┐
│            @nmas/core (TypeScript)           │
│                                              │
│ Turn / Command / Effect / RNG / Rules        │
│ Event Engine / Asset Engine / Project FSM    │
│ Faction / Institution / Validation           │
│                                              │
│ 禁止依赖 React / DOM / localStorage / Steam │
└──────────────────────────────────────────────┘
          │                    │
          │ selectors/events   │
          ▼                    ▼
┌──────────────────┐   ┌──────────────────────┐
│ Web Client       │   │ Desktop Client       │
│ React + Vite     │   │ Tauri + same web UI  │
│ GitHub Pages     │   │ Steam distribution   │
└──────────────────┘   └──────────────────────┘
          │                    │
          └──────────┬─────────┘
                     ▼
              PlatformAdapter
      local / web / Steam / future server
```

第一阶段只完成左侧 Web Client，但所有核心协议按照这个边界写。

---

## 2. 为什么核心改成 TypeScript

当前 JavaScript 原型适合快速试验，但 v0.3 开始出现：

- 事件引用资产；
- 资产绑定配装槽；
- 阵营关系；
- 项目状态；
- 内容包版本；
- 存档迁移；
- 未来多人 command。

这些对象一旦字段写错，错误会延迟到玩家存档以后才出现。

因此：

- UI 可以继续 JSX，逐步迁移；
- `src/vnext/core` 从进入正式开发开始迁到严格 TypeScript；
- `strict: true`；
- 内容 JSON 必须运行时 schema validation。

---

## 3. XState 只用在“真的有状态机”的地方

不把整个游戏强塞进一个巨型状态机。

使用 XState 的对象：

### Project

```text
idea → proposal → accepted → production
                       │          │
                       ▼          ▼
                    rejected    blocked
                                  │
                                  ▼
                                patched
                                  │
                                  ▼
                                 shown → archived
```

### Special Event

```text
queued → presented → choice-pending → resolved → chained/closed
```

### Institution

```text
inactive → operating → strained → crisis → recovered/closed
```

普通 stats / inventory / tags 继续使用纯 reducer/effect，不用 XState。

---

## 4. 回合系统必须先冻结

### 基础时间单位

继续保留当前“一轮 20 个工作单位”。

但内部统一称：

```js
Turn = 1 work unit
Phase = 5 turns
Run = 20 turns
```

### 每回合执行顺序固定

```text
1. Player Command
2. Validate Command
3. Resolve Action Cost
4. Apply Direct Effects
5. Advance Projects
6. Resolve Scheduled Events
7. Evaluate Event Triggers
8. Apply World/Faction Conditions
9. Append History
10. Autosave
```

任何新玩法都只能插入这些明确 hook，禁止随便改变结算顺序。

---

## 5. 一个回合可以不只“点行动”

玩家在一个 Turn 内可以打开很多面板，但只有明确标记为 `turn-consuming` 的 command 才推进时间。

### 不消耗 Turn

- 换配装；
- 看背包；
- 阅读三视角文本；
- 调整机构资产；
- 查看阵营；
- 分享卡片；
- 阅读媒体档案。

### 消耗 Turn

- 跑现场；
- 做提案；
- 制作项目；
- 参加活动；
- 出差；
- 公开回应争议；
- 运营机构项目。

这样网页点击自由度会明显提高，但时间系统仍然可靠。

---

## 6. 短时玩家和长时玩家共用同一个系统

### 1–3 分钟

完成测评 + 一个事件，立即得到一个有趣结果。

### 5–15 分钟

完成一个 Phase（5 Turns），产生一张阶段档案卡。

### 30–60 分钟

完成一整个 Run（20 Turns）。

### 多轮

只继承 Meta Progress，不无脑继承所有钱和能力。

不设计两套玩法。

---

## 7. 平台适配器

核心只能认识接口：

```ts
interface PlatformAdapter {
  storage: SaveAdapter;
  identity: IdentityAdapter;
  achievements: AchievementAdapter;
  sharing: SharingAdapter;
  commerce?: CommerceAdapter;
}
```

### Web

- IndexedDB / Dexie
- Web Share / download
- 匿名本地身份

### Steam Desktop

- 本地文件 / Steam Cloud（后续）
- Steam identity（后续）
- Steam achievements（后续）
- Overlay / friends（真正有玩法再接）

Steam 不应决定 GameState 数据结构。

---

## 8. 桌面发行路径

### Steam Prototype

保留现有 React UI，使用桌面壳打包。

优点：

- 不需要重写玩法；
- GitHub Pages 与 Steam 可以同时发布；
- 艺术媒体资源可以直接复用；
- 后续 Three.js/WebGL/WebGPU 仍然能运行。

如果未来作品转向真正的大规模 3D、物理、角色操控，再单独评估 Godot/Unity 等客户端；核心内容协议和存档协议仍可保留。

---

## 9. 第一阶段建议依赖边界

### Core

- TypeScript
- XState：只负责有限状态机
- runtime schema validator：内容包与存档校验
- deterministic RNG

### Web Storage

- IndexedDB
- Dexie 作为轻量封装

### Tests

必须覆盖：

- reducer 单元测试；
- state machine transition；
- migration；
- content reference validation；
- seeded RNG reproducibility；
- 1000+ 自动 run simulation。

### UI

React 继续使用，暂时不换框架。

---

## 10. 这版真正应该先做的“引擎”

第一阶段不是写 3D renderer。

这里的 Engine 指：

```text
Turn Engine
Event Engine
Effect Engine
Asset Engine
Project State Machine
Faction Rules
Persistence
Content Registry
Validation + Simulation Tests
```

这些稳定以后，UI 可以任意长：

- 纯文本；
- 仿 Fallout terminal；
- 卡片经营；
- 2D 地图；
- Three.js 三维场域；
- Steam 桌面版。

它们不会要求重写游戏本身。
