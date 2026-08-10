# vNext Persistence / Server / Multiplayer

## 1. 第一阶段：纯静态部署也要有正式存档层

GitHub Pages 继续可用，但 UI 不再直接操作 `localStorage`。

统一接口：

```js
export interface SaveAdapter {
  load(slotId): Promise<GameState | null>
  save(slotId, state): Promise<void>
  list(): Promise<SaveMeta[]>
  remove(slotId): Promise<void>
  export(slotId): Promise<Blob>
  import(file): Promise<GameState>
}
```

第一阶段实现：

- `LocalSaveAdapter`：兼容现有存档；
- `IndexedDbSaveAdapter`：正式主存档；
- `JsonExportAdapter`：导入导出。

UI 不关心数据保存在哪。

---

## 2. 为什么长期主存档不能只靠 localStorage

localStorage 继续用于：

- 设置；
- 小型缓存；
- 当前存档指针。

正式存档应逐步转向 IndexedDB，因为未来会保存：

- 大量资产实例；
- 事件历史；
- 媒体索引；
- 多轮档案；
- 多存档槽；
- 机构记录。

媒体本体仍尽量放静态资源/CDN，不把图片二进制塞进存档。

---

## 3. 存档槽

建议默认：

```text
Profile
├── Run 001
├── Run 002
├── Run 003
└── Meta Progress
```

### Run

一轮 20 工作单位的完整状态。

### Meta Progress

跨轮保存：

- 解锁图鉴；
- 罕见身份；
- 事件收藏；
- 机构历史；
- 分享记录；
- 成就；
- 长期资产（必须显式标记 `persistent: true`）。

不要默认所有资产跨轮继承，否则很快数值失控。

---

## 4. 资产持久化

每个资产实例具备生命周期：

```js
{
  persistence: 'run' | 'profile' | 'account',
  tradable: false,
  boundTo: null,
  destroyedAt: null
}
```

### run

只属于当前一轮，例如：临时预算券、一次性借来的设备。

### profile

跨本机存档长期保留，例如：特殊纪念品、稀有档案、隐藏身份凭证。

### account

只有未来联网后才启用，例如：官方联动物品、多人交换资产。

这样可以明确解决“刷新、开新局、换设备到底会不会丢”的问题。

---

## 5. 账号与远程同步

未来增加 `RemoteSaveAdapter`：

```js
syncProfile()
pullSave(saveId)
pushCommands(commands)
resolveConflict()
```

核心原则：

- 客户端本地优先可玩；
- 登录不是进入游戏的前提；
- 登录后可以把本地 profile 绑定到账号；
- 冲突合并以 command sequence / server revision 为依据，而不是“哪个 JSON 更新时间晚就覆盖哪个”。

---

## 6. 服务端边界

后端只负责真正需要可信来源的内容：

### Auth Service

账号、身份绑定、会话。

### Save Service

云存档、版本迁移、备份。

### Inventory Service

`account` 级资产账本。

### Economy Service

游戏内 credits / voucher / 兑换记录。

### Social Service

档案公开、好友、机构访问、合作邀请。

### Room Service（最后阶段）

实时多人房间。

前端静态资源、普通剧情、媒体内容仍可以直接由 GitHub Pages/CDN 提供。

---

## 7. API 形态

服务端第一版只需要稳定的 command API：

```http
POST /v1/commands
GET  /v1/profile
GET  /v1/saves/:id
GET  /v1/content/manifest
GET  /v1/inventory
POST /v1/trades
```

`POST /v1/commands`：

```json
{
  "saveId": "...",
  "expectedRevision": 105,
  "commands": [
    {
      "id": "...",
      "type": "asset.equip",
      "payload": {}
    }
  ]
}
```

服务端返回：

```json
{
  "revision": 106,
  "effects": [],
  "statePatch": {}
}
```

这样未来网页、手机 App、3D 客户端都可以用同一协议。

---

## 8. 兑换系统

兑换不直接写库存：

```text
兑换码 / 活动资格
      ↓
server validate
      ↓
claim transaction
      ↓
asset instance
      ↓
account inventory
```

每次领取必须有唯一 transaction ID，确保刷新/重复请求不会多发。

第一阶段纯离线可以用“本地纪念码”，但必须明确标记为 `unverified`，未来不能自动转成稀缺线上资产。

---

## 9. 多人版本顺序

### M0 — 单机

现在。

### M1 — 公共档案

玩家可以分享只读艺术家档案 / 机构页。

### M2 — 异步合作

- 发合作邀请；
- 联合项目；
- 送普通资产；
- 留言/评价。

### M3 — 异步世界事件

服务器发布一个全服事件，各玩家独立处理，汇总形成“艺术生态统计”。

这很适合艺术作品展览或社交媒体活动。

### M4 — 小房间实时互动

只在确实出现需要实时同步的玩法以后再做。

禁止为了“多人”先做 MMO 架构。

---

## 10. 安全与作弊边界

离线单机允许玩家改存档，不值得反作弊。

只有以下内容需要服务端权威：

- 账号资产；
- 官方兑换；
- 排行 / 公开成就；
- 多人交易；
- 联动资格；
- 未来真实付费相关状态。

艺术作品本体不应该因为反作弊而变得难以保存、迁移或研究。
