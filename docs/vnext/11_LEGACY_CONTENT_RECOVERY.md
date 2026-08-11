# Legacy Content Recovery / 旧内容回收计划

## 结论

仓库早期并不是“内容很少”。Git 历史已经存在大量内容资产：城市、NPC、项目池、职业事件、线上生态、轨迹系统、模拟器生态、艺术流派、作品批判工具集、空间与生活条件等。

当前主要问题不是 Git 历史丢失，而是：

> **旧内容在数次 UI / 架构重构后，没有形成一份明确的迁移索引，因此大量内容仍在历史提交或旧目录中，却没有进入当前 v0.5 / v0.6 的可玩运行时。**

这份文档用于阻止再次“重写一遍”。

---

## 已确认的旧内容资产

依据仓库提交历史，至少存在：

### 人物 / NPC
- 30 个左右旧 NPC / 关系人物。
- 包含技术、策展、概念型、AI 先锋、网红艺术家、怪人、水货、大佬等旧原型。
- 当前策略：不批量恢复成通讯录；筛选为强人物原型、事件触发者和 Lens。

### 项目 / 任务
- 40+ 项目池。
- 覆盖申请、文档、现场、商业、研究、生存。
- 当前策略：转成 Career Episode / Brief / Blueprint Challenge，而不是旧任务列表。

### 城市 / 场域
- 中国多城市与海外城市内容。
- 上海、深圳、杭州、成都、广州、南京、武汉、重庆、西安等，以及巴黎、柏林、首尔、新加坡、米兰、阿姆斯特丹、巴塞尔、洛杉矶、悉尼、维也纳、哥本哈根等。
- 当前策略：不恢复为“点城市旅游地图”。提取场域类型、机构条件、资源生态、人物网络和事件素材。

### 事件
- 展览、工作坊、派对、事故。
- 15+ 职业事件。
- 特殊事件：现实 / 讽刺 / 荒诞。
- 当前策略：进入通用事件池、条件事件池、Episode 专属事件池。

### 生态 / 线上世界
- Online Ecosystem。
- 小红书、播客、替代空间、工作坊、驻留等素材。
- 当前策略：进入 FIELD / SIGNAL、RECORDS / ECOLOGY、NETWORK Stage。

### 轨迹 / 档案
- 玩家记录模板。
- 报告模板。
- 协作模板。
- 平台规格。
- 玩家统计与生态系统。
- 当前策略：迁移为 Career Archive、Evidence、Blueprint Lineage、试玩结束摘要。

### 艺术谱系 / 方法
- 六大艺术流派页面。
- 后续扩展到 8 条实践谱系。
- 作品批判工具集。
- 当前策略：不恢复“流派选职业”。拆成 Method / Lineage / Lens / Archive Fragment。

### 生存 / 基础设施
- 生活条件与工作室 6 阶段。
- 10 种补救手段 / “总有招”。
- 当前策略：作为资源条件、基础设施事件、恢复方法和黑色幽默素材，不成为独立升级菜单。

---

## 四类迁移状态

所有旧内容进入以下四类之一：

### A. DIRECT / 可直接迁移
结构和文本仍然适用，只需要换 ID / 数据 schema。

典型：
- 具体故障事件；
- 现场经验；
- 设备与场地约束；
- 项目 Brief；
- 方法条目；
- 线上生态事实。

### B. REWRITE / 需要改写
主题仍然有价值，但旧语气、数值或“职业 RPG”结构不再适用。

典型：
- 旧 NPC；
- 城市内容；
- 流派；
- 声望 / 8 维数值；
- “商业 vs 艺术”式评价。

### C. ARCHIVE / 只保留档案
有历史意义，但不应回到主玩法。

典型：
- 旧 UI 概念；
- 废弃菜单结构；
- 旧版本命名；
- 早期大而全世界地图。

### D. RETIRE / 明确废弃
会破坏当前核心设计，不再迁移。

典型：
- affection 好感条；
- 泛化总艺术分；
- 纯城市旅行地图；
- 与玩法无关的硬件升级数值；
- 为了数量制造的 NPC；
- 资源不足导致主线不可点击。

---

## 迁移到当前结构

### FIELD
旧内容来源：城市、机构、线上生态、NPC、事件。

新用途：
- Environment Conditions
- People / Lens
- Signals
- Notes
- Availability / 可获得性

### WORKBENCH
旧内容来源：项目、技能、作品系统、媒介、设备。

新用途：
- Blueprint Node Library
- Brief
- Run / Fail / Modify
- Capability / Mastery
- Resource / Production Graph

### RECORDS
旧内容来源：轨迹、艺术流派、批判工具、历史文本。

新用途：
- Archive
- Methods
- Lineage
- Ecology
- Triumphs
- Career Archive

---

## 8/28 Demo 优先回收清单

不要先恢复 300 个文件。只选择能直接改善 20 分钟试玩的内容：

1. 6 个强 NPC 原型。
2. 12 个特殊事件。
3. 12 个 Project Brief。
4. 20 个 Method / Lineage Fragment。
5. 20 个设备 / 资源 / 场地条件节点。
6. 8 篇 Ecology / Archive 短文本。
7. 6 个 Triumph / Challenge。
8. 3 个完整 Blueprint Challenge。

---

## 第一批建议内容包

### Pack 01 / LIVE SYSTEM
- 摄像头
- 音频分析
- MIDI
- 实时图形
- 延迟
- Feedback
- 渲染电脑
- 投影
- LED
- 黑盒
- 多输出漂移
- 恢复路径

### Pack 02 / DEAD MEDIA
- VHS
- VCD
- CRT
- 老视频格式
- 格式损坏
- 转码
- 媒体考古
- 挪用
- 反馈录像
- 旧显示设备供应链

### Pack 03 / SITE + PRODUCTION
- 场地尺寸
- 供电
- 网络
- 吊点
- 禁止打孔
- 搭建时间
- 运输
- 技术人员
- 分镜
- Scope
- 预算
- Runbook

---

## 内容回收纪律

新增内容前先搜索旧仓库。

每一条旧内容必须留下来源：
- legacy path 或 commit；
- 新 stable ID；
- migration status；
- 进入哪个 Episode / Node Pack / Archive Collection；
- 是否已在浏览器试玩中出现。

不要再发生：

> “旧版有 40 个项目 → 新版觉得内容少 → 又重新写 40 个项目”。

我们需要的是**迁移、重写、连接**，不是重复生产。
