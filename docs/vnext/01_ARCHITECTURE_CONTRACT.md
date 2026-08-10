# vNext Architecture Contract

> 本文件只冻结“以后很难改”的东西。具体 UI、事件内容、图片、数值平衡、3D 表现都不在冻结范围内。

## 1. 核心原则：一个状态源，多个玩法面板

所有面板共享同一个 `GameState`。禁止某个小游戏、机构面板、背包、阵营系统私自维护另一份真相。

```text
UI / 2D / 3D / mobile web
          ↓ commands
      Game Core
          ↓ events
      GameState
          ↓
Persistence Adapter
 local / indexedDB / server
```

UI 只发命令，不直接改状态；Game Core 负责验证、结算和记录。

---

## 2. GameState v1

```js
{
  schemaVersion: 1,
  saveId: 'uuid',
  playerId: 'local-or-account-id',
  createdAt: 'ISO',
  updatedAt: 'ISO',
  turn: 1,
  phase: 1,
  seed: 'stable-random-seed',

  profile: {
    displayName: '',
    archetypeId: null,
    identityTags: [],
    credentials: []
  },

  stats: {},

  loadout: {
    methodology: null,
    tool: null,
    interface: null,
    survival: null,
    wildcard: null,
    vehicle: null,
    companion: null
  },

  inventory: {
    assetInstanceIds: []
  },

  assets: {
    byId: {}
  },

  projects: {
    byId: {},
    activeIds: [],
    archivedIds: []
  },

  factions: {
    byId: {}
  },

  institutions: {
    byId: {}
  },

  world: {
    currentRegionId: null,
    currentSubmapId: null,
    flags: [],
    conditions: []
  },

  scheduledEvents: [],
  history: [],

  meta: {
    unlockedContent: [],
    achievements: [],
    seenEventIds: []
  }
}
```

### 为什么资产必须实例化

禁止继续只存：

```js
patchKit: 3
```

改成：

```js
assets.byId['asset-instance-92'] = {
  instanceId: 'asset-instance-92',
  templateId: 'patch-kit',
  createdAt: '...',
  durability: 2,
  tags: ['portable', 'repair'],
  boundTo: null,
  customData: {}
}
```

这样以后同一种物品才能拥有不同状态、来源、耐久、稀有度、签名、改造、绑定关系，也才能安全做交易和多人同步。

---

## 3. Command / Effect 协议

### Command

玩家行为统一通过 command 进入核心：

```js
{
  id: 'command-uuid',
  type: 'event.choose',
  payload: {
    eventInstanceId: '...',
    choiceId: '...'
  },
  clientTime: 'ISO'
}
```

### Effect

内容不能随意写 JavaScript 改状态，只能声明允许的 effect：

```js
{ type: 'stat.delta', key: 'funds', value: -2 }
{ type: 'asset.spawn', templateId: 'patch-kit' }
{ type: 'asset.consume', instanceId: '...' }
{ type: 'tag.add', scope: 'player', tag: 'overexposed' }
{ type: 'faction.reputation', factionId: 'academy', fame: 1, infamy: 2 }
{ type: 'project.transition', projectId: '...', to: 'blocked' }
{ type: 'event.schedule', eventId: '...', afterTurns: 2 }
{ type: 'institution.metric', institutionId: '...', key: 'cashflow', delta: -1 }
```

**这是 vNext 最重要的维护约束。**

任何插件、事件包、3D 场景都不能绕过这套 Effect API。

---

## 4. Event Sourcing Lite

每次成功 command 都追加一条历史记录：

```js
{
  sequence: 105,
  commandId: '...',
  type: 'event.choose',
  turn: 8,
  input: {...},
  effects: [...],
  rng: {
    seed: '...',
    roll: 0.413
  },
  contentVersion: 'core-events@0.3.0',
  createdAt: '...'
}
```

不要求第一阶段真正通过完整日志重建世界，但历史记录必须足够用于：

- 调试；
- 解释“为什么变成这样”；
- 生成生涯年鉴；
- 分享；
- 存档迁移；
- 服务端作弊校验；
- 未来回放。

---

## 5. 随机必须可复现

禁止核心规则直接散落使用 `Math.random()`。

统一：

```js
rng.next(namespace)
```

输入：`save seed + turn + namespace + sequence`

这样：

- bug 可复现；
- 同一事件不会刷新页面无限重抽；
- 服务端可以验证；
- 后续多人同步不会因客户端随机不同步。

---

## 6. 阵营关系不是单条好感度

默认使用双轴：

```js
{
  factionId: 'academy',
  fame: 4,
  infamy: 3,
  membership: 'associate',
  obligations: ['submit-report'],
  privileges: ['jury-access']
}
```

允许形成矛盾身份：

- 被学院认可，同时被认为难合作；
- 在商业场域很有名，同时信誉很糟；
- 独立圈尊重你，但没人愿意给钱。

这比“一根声望条”更符合本作品。

---

## 7. 项目必须有状态机

统一状态：

```text
idea
→ proposal
→ accepted
→ production
→ blocked
→ patched
→ shown
→ archived

任意阶段可进入 cancelled / abandoned / repurposed
```

事件只改变项目状态和属性，不重新发明一套项目逻辑。

---

## 8. 保存与版本迁移

每份存档必须有：

- `schemaVersion`
- `contentVersions`
- `saveId`
- `updatedAt`
- checksum（远程存档阶段启用）

迁移采用单向 migration：

```text
v1 → v2 → v3
```

不允许新版本代码里到处写“如果旧存档没有这个字段就临时补一下”。

---

## 9. 钱包与身份认证边界

### 第一阶段

`wallet` 只表示游戏内账本，不涉及真实货币：

```js
wallet: {
  credits: 0,
  vouchers: [],
  ledger: []
}
```

### 未来联网

认证由 `AuthAdapter` 提供：

```js
getSession()
signIn()
signOut()
linkIdentity()
```

核心游戏代码禁止直接依赖某个登录供应商。

### 数字钱包预留

如果以后需要连接外部钱包，作为一种 `credential` / `identity provider` 插件接入，不把链上逻辑写进核心 GameState。

---

## 10. 多人预留

v0.3 仍然单人。

未来多人只允许三类同步模式逐步加入：

1. **异步展示**：访问别人档案、机构、展览；
2. **异步交换**：资产交换、联合项目、邀请；
3. **实时房间**：最后才做。

服务端多人阶段采用“服务器权威”：客户端提交 command，服务端验证并产生 effects。

这能避免后期重写背包、钱包、交易和阵营逻辑。

---

## 11. 绝对禁止的架构债务

- UI 组件直接 `state.funds += 5`；
- 插件直接执行任意远程 JS；
- 物品只按数量存储而没有实例 ID；
- 每个小游戏定义自己的玩家身份；
- 刷新页面重新抽关键随机事件；
- 网络版相信客户端上传的“我有 10000 credits”；
- 因为某个新内容包而修改所有旧事件；
- 把服务商 SDK 散落在各 UI 组件中。
