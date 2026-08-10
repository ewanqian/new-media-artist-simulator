# V0.5 Practice Build Model

## 0. 核心对应

GT 中：

`Player → Car → Tuning → Track → Race → Reward`

本项目：

`Artist Practice → Project → Workbench → Location → Situation → Consequence`

艺术家本人不是“汽车”。

更准确的对象是 **Practice Build（实践构型）**：一个人在当下阶段由什么方法、技能、语言、关系和经验组成。

Project 才是被带入不同场域接受测试的对象。

---

## 1. Practice Build 不使用职业等级

玩家不选“法师 / 战士式职业”。

开局只选择一种 Starting Practice，它只决定开局偏置，之后可以自然混合。

建议 6 个起始实践：

### A. Systems / Generative

系统 / 生成实践

- 生成规则
- 软件艺术
- 网页原生
- 工具开发
- 自动化 / agent workflow

典型语言：
`规则 / 协议 / 系统 / 反馈 / 运行 / 版本`

### B. Spatial / Installation

空间 / 装置实践

- 空间叙事
- 投影 / 多屏
- 传感器
- 空间声音
- 沉浸与场域

典型语言：
`尺度 / 身体 / 动线 / 场所 / 视线 / 安装`

### C. Live / Performance

现场 / 演出实践

- VJ / AV
- 实时系统
- 舞台视觉
- 灯光 / 信号
- 即兴与演出

典型语言：
`cue / timing / signal / rehearsal / fallback / live`

### D. Image / Capture

影像 / 扫描实践

- 摄影 / 影像
- 点云 / Gaussian / 3D capture
- 合成
- 实时图形
- 数字场景

典型语言：
`frame / capture / reconstruction / texture / image / archive`

### E. Research / Critique

研究 / 批评实践

- 写作
- 档案
- 媒介批评
- 策展研究
- 制度与技术反思

典型语言：
`context / question / evidence / framing / institution / medium`

### F. Production / Commission

制作 / 委托实践

- 商业项目
- 大型交付
- 团队协作
- 预算与供应商
- 展演制作

典型语言：
`brief / budget / scope / delivery / schedule / responsibility`

这些不是封闭流派。

例如玩家可以逐渐形成：

`Spatial + Live + Systems`

或者：

`Research + Image + Web`

这才接近真实的新媒体艺术实践。

---

## 2. Skill 不再是装备槽

旧版“技能插槽”会产生物品栏感。

V0.5 改成 **Skill Graph + Context Activation**。

玩家学会技能后永久存在，不需要每回合装备。

场景自动检测相关技能。

### Skill Family 1 — MAKE

制作能力

- realtime-graphics
- web-authoring
- generative-system
- spatial-pipeline
- sound-signal
- capture-scan
- physical-interface
- ai-assisted-coding

### Skill Family 2 — STAGE

现场能力

- site-survey
- signal-routing
- technical-rider
- multi-output
- rehearsal
- emergency-patch
- audience-flow

### Skill Family 3 — READ

研究 / 判断能力

- field-research
- critical-reading
- archive-method
- opportunity-reading
- institution-reading
- media-literacy

### Skill Family 4 — COMMUNICATE

协作 / 文本能力

- project-statement
- pitch
- client-translation
- curator-dialogue
- team-brief
- grant-writing
- refusal

### Skill Family 5 — SURVIVE

职业生存

- budgeting
- scheduling
- scope-control
- maintenance
- documentation
- negotiation
- recovery

---

## 3. 技能最重要的作用：改变语言

Skill 不应该主要提供：

`+2 技术`

它更应该让玩家在同一个情境里看见不同动作。

例如一个 Open Call：

普通玩家看到：

- 投递
- 不投

拥有 `opportunity-reading`：

- 检查主办方过去三届项目与实际支持是否匹配

拥有 `budgeting`：

- 先计算制作费、运输与垫资风险

拥有 `critical-reading`：

- 把主题文本拆成真正的策展问题

拥有 `client-translation`：

- 写一个机构能读懂但不改掉项目核心的版本

因此不同 Practice 的差异首先发生在 **文本选择**，而不是数字面板。

---

## 4. 六个通用 Action Verb

为了让复杂内容保持简单，游戏所有场景最终收束成 6 个通用动词：

- MAKE — 做
- TEST — 测
- READ — 读 / 判断
- TALK — 沟通
- SHOW — 发布 / 展示
- ARCHIVE — 保存 / 回收

不同技能只是让这些动词出现更具体的变体。

例如：

`TEST`

可以在不同上下文变成：

- 浏览器稳定性测试
- 黑盒信号测试
- 观众交互观察
- 预算压力测试
- 展厅现场测试

UI 不需要新增按钮类型。

---

## 5. Artist Evaluation 不存在统一总分

不要设置：

`艺术性 83`

真实世界的评价依赖场域。

项目拥有 6 个可操作维度：

- Coherence — 项目是否形成自己的逻辑
- Stability — 能否可靠运行
- Site Fit — 是否适合当前空间
- Legibility — 是否能被理解 / 被介绍
- Documentation — 是否留下足够记录
- Delivery — 是否能按条件完成

不同场域使用不同 Lens。

### Artist-run Space Lens

看重：
- Coherence
- Experiment
- Reciprocity

### Institution / Museum Lens

看重：
- Coherence
- Documentation
- Site Fit
- Legibility

### Live Venue Lens

看重：
- Stability
- Responsiveness
- Delivery

### Commercial Commission Lens

看重：
- Delivery
- Stability
- Budget
- Visual Impact

### Residency Lens

看重：
- Process
- Adaptability
- Articulation

因此一个“很好的作品”完全可能不适合某一次机会。

这比统一 Reputation 分数更接近真实生态。

---

## 6. Opportunity System

每个机会是一张 Opportunity Card。

玩家看见：

- Who
- Where
- Deadline
- Fee / Budget
- Required Output
- Public Description

系统内部还有隐藏字段：

- supportQuality
- rightsRisk
- paymentRisk
- scopeRisk
- prestigeReality
- curatorialDepth
- technicalSupport
- networkValue

低经验玩家只看见公开信息。

随着：

- opportunity-reading
- institution-reading
- budgeting
- network intel

逐渐揭露风险。

所以“水展览 / 好展览 / 坏机会 / 有意思但没钱 / 钱多但无聊”不需要硬编码成 GOOD / BAD。

玩家学会自己判断。

---

## 7. 商业与艺术不使用道德条

不要：

`艺术 +10 / 商业 -10`

商业项目可能：

- 带来资金
- 提升制作能力
- 认识很强的技术人员
- 消耗全部注意力
- 让自己的项目停两个月
- 形成新的客户标签

艺术项目可能：

- 没有制作费
- 提升作品
- 建立机构关系
- 产生大量垫资
- 获得一次真正重要的展示
- 也可能只是一个非常水的群展

选择改变的是 **Trajectory（轨迹）**。

系统会根据过去经历改变以后送来的机会。

例如长期接大型屏幕项目：

系统逐渐更容易送来：
- commercial-live
- visual-production
- stage-support

但玩家仍然可以主动改变路线。

---

## 8. Relationship System

人物关系不显示爱心或好感度。

UI 只显示自然语言状态：

- 第一次见
- 认识
- 合作过
- 信任你的技术判断
- 觉得你会拖延
- 欠你一次人情
- 你欠他一次
- 只在有预算时联系你
- 喜欢你的作品，但不会给你项目
- 经常邀请你，但每次都没钱
- 是朋友，不适合一起工作

内部可以有三个简单值：

- Familiarity
- Trust
- Obligation

再加 memory tags。

人物真正重要的是 **记得发生过什么**。

---

## 9. Money

资金只保留：

`Cash`

不要做复杂财务游戏。

但项目拥有现金流状态：

- advance
- reimbursement
- delayed-payment
- self-funded
- paid
- loss

真正产生压力的是：

`Attention + Deadline Clock + Cash`

而不是十几个资源条。

---

## 10. Project

同时最多：

- 1 Primary Project
- 2 Side Projects

其余进入 Archive。

避免几十个任务同时挂在 UI。

每个 Project Card：

```text
Name
Question
Methods
Current Build
Next Problem
History
```

项目不是任务。

项目可以暂停、失败、重做、拆解、换媒介、重新出现。

---

## 11. Practice Vocabulary

随着玩家经历，Profile 会积累 Vocabulary Tags。

例如：

- maintenance-as-method
- live-system
- archive-loop
- spatial-choreography
- computational-image
- institutional-critique
- field-infrastructure
- audience-interface

这些词不是“称号”。

它们会改变：

- Café 对话
- 项目描述
- NPC 如何称呼你
- 后续机会
- 最终 Career Archive

---

## 12. 2026 Content Layer

时代变化必须作为 Content Pack，而不是 Core Rule。

2026 第一批内容标签建议：

- realtime GPU point workflow
- AI-assisted coding / agent workflow
- generative image saturation
- Gaussian / radiance-field capture
- WebGPU / browser-native work
- spatial computing
- immersive media
- self-hosted archive
- digital preservation
- model / API dependency
- provenance / training-data / rights
- artist-run infrastructure
- live production interoperability

以后 2027 只换 Content Pack，不改基础系统。

---

## 13. 最重要的约束

所有复杂系统最终必须回答下面四个问题之一：

1. 我现在在哪里？ → World
2. 我为什么要做这件事？ → Café / Opportunity
3. 我现在能怎么做？ → Practice / Project / Workbench
4. 做完以后世界记住了什么？ → Archive / Relationship / World State

回答不了四个问题之一的功能，不进主框架。
