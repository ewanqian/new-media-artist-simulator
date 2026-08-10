# v0.3 Systemic Satire — 第一阶段里程碑

## 目标

先把未来五年最难替换的“骨架”做对，再做内容扩容。

### Definition of Done

v0.3 Foundation 只有满足以下条件才算完成：

- [ ] 现有 GitHub Pages 仍能点开即玩；
- [ ] 旧版 20 工作单位循环没有被破坏；
- [ ] GameState v1 成为唯一新状态协议；
- [ ] 所有新系统只能通过 command/effect 改状态；
- [ ] 核心随机可复现；
- [ ] 新资产使用 instance id；
- [ ] 新项目使用统一状态机；
- [ ] 阵营使用 fame/infamy + membership；
- [ ] 新事件使用 official/hype/satire 三视角；
- [ ] 至少 12 个特殊事件真正进入玩法；
- [ ] 每个特殊事件至少改变资产/身份/阵营/后续事件中的两项；
- [ ] 背包里至少 12 个物品真正可使用，而不是只展示数量；
- [ ] 现有 emergency 补救手段正式接入事件选择；
- [ ] 存档经过 SaveAdapter，不再由 UI 直接碰 localStorage；
- [ ] 至少支持 3 个存档槽；
- [ ] 有 schema migration 入口；
- [ ] 内容 pack 有 manifest + 版本；
- [ ] 有自动内容引用检查；
- [ ] 可以批量模拟游戏并检查非法状态；

---

## P0 — 先做，不讨论 UI 美化

### P0.1 Core Contract

- GameState v1
- Command
- Effect
- deterministic RNG
- history record

### P0.2 Persistence

- SaveAdapter
- IndexedDB
- JSON export/import
- legacy save migration

### P0.3 Content Registry

- pack manifest
- schema/reference validation
- stable entity IDs

### P0.4 Event Engine

- trigger
- choice
- effect
- chain
- media reference
- three perspectives

### P0.5 Asset Engine

- instance inventory
- equip
- consume
- modify/tag
- persistence lifecycle

### P0.6 Project State Machine

把现有“挂项目等倒计时”迁移到统一状态机，但第一版仍可保留倒计时作为 production 的一种推进方式。

---

## P1 — 让它明显更好玩

### P1.1 12 个“系统事件”垂直切片

不要先做 100 个。

选择覆盖：

- AI 作者性
- 甲方修改
- 展览安装
- 黑屏/掉帧
- open call
- 驻留
- 媒体误读
- 小红书爆帖
- 开源授权
- 预算削减
- 场地临时变化
- 旧作品被重新发现

### P1.2 12 个可操作资产

例如：

- 备用迷你主机
- 祖传 HDMI 转接头
- 临时投影机
- 一份过期 open call 模板
- 甲方关系卡
- 破损硬盘
- 开源代码包
- 可移动扫描装置
- 怪异轮式工作台
- 展览身份牌
- 一张“内部邀请”
- 未验证的 AI 作品证书

每件物品至少有两个用途。

### P1.3 4 个阵营

先做：

- 学院/机构
- 商业制作
- 独立空间
- 技术/开源社群

每个阵营只需：入口、特权、义务、冲突。

### P1.4 一个机构经营小面板

只做一个“独立工作室”。

可放：

- 设备资产；
- 当前项目；
- 现金流；
- 公开活动；
- 一名合作接口。

先证明 Institution 系统能成立，再扩画廊/厂牌/研究组。

---

## P2 — 表现与传播

### P2.1 Event Card

特殊事件作为完整卡片：

- 标题；
- 媒体；
- 三视角切换；
- 选择；
- 后果；
- 分享。

### P2.2 小红书友好分享卡

默认支持 3:4 / 4:5 视觉模板：

- 本轮最荒诞事件；
- 艺术家身份鉴定；
- 阵营关系；
- 背包奇怪物品；
- 机构经营状态；
- 年度总结。

分享是表现层，不得影响核心结算。

### P2.3 媒体包

图片/GIF/视频只通过 media registry 进入游戏。

---

## P3 — 之后再考虑

- 3D 场域；
- Three.js / WebGPU 场景；
- 机甲/载具可视化；
- 云账号；
- 多人；
- 交易；
- 活动兑换；
- 手机 App 包装。

它们全部建立在 P0 协议之上。

---

## 一个最重要的删减规则

任何新功能开工前问：

> 它是否让两个已有系统产生新的组合？

如果只是“又多一个页面 / 又多一种数值 / 又多一个 NPC”，默认不做。

如果它能让“事件 × 资产 × 阵营 × 项目 × 场域”产生新结果，优先做。
