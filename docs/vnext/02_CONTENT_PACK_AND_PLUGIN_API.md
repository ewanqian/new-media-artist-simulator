# vNext Content Pack / Plugin API

## 1. 目标

未来新增以下内容，不应该改核心引擎：

- 新事件；
- 新阵营；
- 新项目；
- 新资产；
- 新角色；
- 新媒体素材；
- 新机构模板；
- 新地区；
- 新子模拟器；
- 节日联动 / 小红书联动 / 展览联动。

第一阶段插件以**数据包**为主，不允许远程包执行任意 JS。

---

## 2. Pack Manifest

每个内容包必须有 manifest：

```json
{
  "id": "core-2026-art-ecosystem",
  "name": "2026 艺术生态主包",
  "version": "0.3.0",
  "schemaVersion": 1,
  "engine": ">=0.3.0 <0.4.0",
  "dependencies": [],
  "content": {
    "events": "events.json",
    "assets": "assets.json",
    "factions": "factions.json",
    "projects": "projects.json",
    "institutions": "institutions.json",
    "media": "media.json"
  }
}
```

### 规则

- `id` 永久不改；
- `version` 使用语义化版本；
- 内容实体 ID 永久稳定；
- 删除旧内容时保留 tombstone / redirect；
- 存档记录它使用过的 pack version。

---

## 3. 内容类型

### EventTemplate

```js
{
  id,
  title,
  tags: [],
  rarity,
  trigger,
  perspectives: {
    official,
    hype,
    satire
  },
  media: [],
  choices: []
}
```

### AssetTemplate

```js
{
  id,
  name,
  category,
  tags: [],
  stackPolicy: 'instance',
  rarity,
  durabilityModel: null,
  affordances: ['equip', 'consume', 'trade', 'modify'],
  slots: [],
  media: []
}
```

### FactionTemplate

```js
{
  id,
  name,
  tags: [],
  entryRules: [],
  ranks: [],
  privileges: [],
  obligations: [],
  rivalries: []
}
```

### InstitutionTemplate

```js
{
  id,
  name,
  slots: ['space', 'staff', 'equipment', 'program', 'media'],
  metrics: ['cashflow', 'visibility', 'credibility', 'maintenance'],
  actions: []
}
```

---

## 4. 媒体资产

事件可以绑定预生成内容：

```js
{
  id: 'media_email_ai_authorship',
  type: 'image',
  src: './media/events/ai-authorship/email.webp',
  alt: '...',
  aspectRatio: '4/5',
  shareSafe: true,
  credit: 'in-project'
}
```

支持逐步扩展：

- image
- gif/webp
- video
- audio
- faux-document（假文件）
- faux-chat（聊天截图）
- poster
- 3d-scene（后续）

媒体是事件表现层，不参与核心数值逻辑。

---

## 5. 面板插件

v0.3 只允许内置 panel plugin：

```js
{
  id: 'institution-console',
  route: 'institution',
  requires: ['feature:institution'],
  reads: ['institutions', 'assets', 'factions'],
  commands: ['institution.assignAsset', 'institution.runProgram']
}
```

以后可以有：

- InventoryPanel
- FactionPanel
- InstitutionPanel
- MediaFeedPanel
- VehiclePanel
- ExhibitionPanel
- AuctionPanel
- ResidencyPanel

面板只能读 selector、发 command，不能直接写 GameState。

---

## 6. 验证机制

内容在进入生产版前必须过四关：

### Schema Validation
字段、类型、ID、版本合法。

### Reference Validation
事件引用的资产、阵营、媒体、后续事件都存在。

### Rule Validation
Effect 必须属于白名单，不允许任意代码。

### Simulation Validation
批量模拟至少 1000 轮，检查：

- 资源是否无限膨胀；
- 是否存在必死循环；
- 是否存在无法退出的事件链；
- 是否有永远触发不了的内容；
- 是否出现非法负库存；
- 是否出现项目状态机跳跃错误。

---

## 7. 内容更新工作流

```text
写事件 / 生成媒体
       ↓
content pack
       ↓
validate
       ↓
simulate
       ↓
preview
       ↓
publish manifest version
       ↓
GitHub Pages / CDN
```

未来可以让 AI 辅助批量写事件，但 AI 生成内容只能进入 `draft`，必须通过同一验证链。

---

## 8. 联动内容

例如“小红书联动包”：

```json
{
  "id": "collab-xhs-2026-09",
  "version": "1.0.0",
  "expiresAt": "2026-10-31",
  "content": {
    "events": "events.json",
    "media": "media.json",
    "assets": "assets.json"
  }
}
```

联动可以追加：

- 限时事件；
- 特殊资产；
- 分享模板；
- 机构皮肤；
- 新结局片段。

但不能让联动包修改核心规则。

---

## 9. 长期兼容策略

核心引擎只认识：

- command；
- effect；
- schema；
- state machine；
- content manifest。

内容可以无限增长，核心协议尽量不变。
