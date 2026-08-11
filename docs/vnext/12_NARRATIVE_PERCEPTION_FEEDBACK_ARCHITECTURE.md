# Narrative / Perception / Feedback Architecture

## 目的

特殊章节不能各自制造一套 UI。新媒体艺术家模拟器需要一套可以持续用于主线、Episode、教程和 Blueprint 的感知设计语言。

核心区分：

> **全局系统负责“玩家获得了什么 / 状态发生了什么”。Episode 负责“这件事为什么在这里发生 / 它如何被演出来”。**

---

## A. 全局能力

以下反馈必须跨所有 v0.5 / v0.6 页面复用，不允许 Episode 自己画另一套：

### 1. NODE UNLOCKED
用于：
- 新设备节点
- 新媒介节点
- 新方法节点
- 新场地 / 资源节点

表现：短暂全局提示。新手阶段可更强，后期自动降低权重。

### 2. METHOD LEARNED
用于玩家真正学到可复用方法：
- 离场前检查
- 先诊断再重建
- Scope 收缩
- 保留扫描缺口
- Runbook

方法不是 XP +1。它必须能在后续 Project / Blueprint 中重新使用。

### 3. RECORD ADDED
Evidence / Note / Archive Fragment 的轻提示。
不应每条都打断玩家；只有重要记录才显式弹出。

### 4. RELATIONSHIP UPDATED
只在关系发生结构变化时提示：
- 第一次建立合作
- 信任断裂
- 共同项目形成
- 隐藏身份被揭示
- 关键承诺 / 债务

不是好感度 +5。

### 5. TRIUMPH / CHAPTER COMPLETE
大反馈：
- 完成教程
- 完成 Special Chapter
- 形成第一个公开版本
- 完成特殊 Challenge

可使用全屏 / 大面积 Overlay，但必须可立即跳过。

---

## B. Episode 专属能力

以下内容由具体章节决定，但调用统一组件：

### 1. SCENE LOAD / 文字过场
内容：
- 时间
- 地点
- 当前角色身份
- 当前任务

不使用空泛“场景文学标题”当主标题。
建议 0.8–1.2 秒自动进入；点击可立即跳过。

### 2. DIALOGUE STAGE
顺序：
1. 人物出现
2. 对话逐段展开
3. 信息 / 仪表 / 现场状态出现
4. 最后出现玩家选择

禁止一打开页面就把所有选项按钮摊开。

### 3. EPISODE INSTRUMENT / QTE-LITE
不是另造小游戏，而是把具体工作状态可视化：
- Camera Solve
- Signal Monitor
- Field Check
- Installation Timer
- Network Drop
- Budget / Scope Change

它只负责当前情境，不保存另一份游戏状态。

### 4. NARRATIVE FACT / CONTRADICTION
Episode 负责定义：
- 谁说了什么
- 谁隐瞒什么
- 什么信息互相冲突
- 玩家什么时候验证

全局 Narrative Runtime 负责记忆和状态。

---

## C. 从旧 UI 迁移

### 从长期右栏移走
- NODE UNLOCKED 列表 → Global Feedback + Records
- Evidence 数量墙 → Global Feedback + Archive
- Narrative State 数值墙 → 只在需要时通过剧情表现
- Training 百科列表 → 章节内分步解锁 / 工作图任务

### 保留为轻 HUD
只允许显示当前必须知道的少量信息，例如：
- Skills 3
- Nodes 5
- Records 4
- 当前 Contradiction 1

HUD 不承担知识库功能。

### 从首页移走
Special Route / Episode 不作为和“生涯 / 自由创作”并列的一级模式。

正确入口：

`首页 → 生涯 / 章节 → 主线生涯 / 特殊章节`

---

## D. 教学章节标准

教程必须比正常章节提供更强的反馈，但不创造特殊规则。

一项教学内容至少包含：
1. 情境：为什么现在需要它。
2. 知识：一句可以理解的原则。
3. 操作：玩家亲手完成一次。
4. 失败：允许做错，展示后果，不锁死。
5. 解锁：节点 / 方法 / Evidence 进入全局系统。
6. 完成：明确的章节或训练完成反馈。

例如 Butterfly Capture 01：

`采集 → 现场检查 → 相机求解 → 选择表示`

工作图故意断开三条连接；玩家必须自己补完。

---

## E. 强度分级

### ONBOARDING / 入门
- 强 Scene Load
- 明确 Objective
- NODE UNLOCKED 显著
- 工作图任务条常驻

### NORMAL / 常规
- Scene Load 缩短
- 小提示为主
- Objective 只在需要时出现

### EXPERT / 熟练
- 大部分 Feedback 静默写入 Records
- 只提示异常、重大解锁和 Triumph

因此同一系统可以支撑新手教学，也不会让后期体验充满弹窗。

---

## F. 当前第一套验证

### Special 01 / 哥斯达黎加的蝴蝶学者
正在验证：
- 全屏文字 Scene Load
- 延迟出现的 Dialogue Choice
- Field Check Instrument
- Camera Solve Instrument
- Node / Method 全局解锁提示
- Narrative Fact / Contradiction
- 章节完成 Triumph
- 三段断线 Blueprint Training

后续任何新 Episode 必须尽量调用这些能力，不再自行复制组件。
