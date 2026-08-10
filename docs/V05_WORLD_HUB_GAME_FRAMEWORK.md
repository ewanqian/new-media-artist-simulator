# V0.5 World Hub Framework

## 一句话

把“新媒体艺术家模拟器”从纵向文字流改造成一个 **World Map 驱动的 Artist Life Simulator**：

> 世界地图负责空间，咖啡馆负责任务与叙事，工作台负责制作与升级，Stage Forge 负责演出/展览模拟，档案负责长期记忆。

核心不是增加更多页面，而是让每个页面只承担一种明确行为。

---

## 1. 主循环

```text
BOOT / PROFILE
      ↓
WORLD MAP
  ├─ CAFÉ / NOTEBOOK  ← 主任务、人物、新闻、文本流
  ├─ WORKBENCH        ← 项目制作、机器/工具配置
  ├─ FIELD / VENUE    ← 地点行动、遭遇、工作机会
  ├─ STAGE FORGE      ← 演出、展览、空间预演
  ├─ EXCHANGE         ← 设备/材料/二手工具
  └─ ARCHIVE          ← 项目历史、故障、文本、媒体
      ↓
RESULT / NEW CONDITION
      ↓
WORLD MAP CHANGES
```

玩家一直回到 World Map，因此世界具有空间连续性。

---

## 2. 三个维度

### X / Y：空间关系

地图不是菜单列表。每个地点必须拥有二维位置和相对邻接关系。

第一版不需要真正 GIS，也不需要开放世界。用抽象“城市生态图”即可。

建议保留旧版 6 个 Region，但重新放进一张抽象世界图：

- 榕树湾工作区：起始工作室 / 生活 / 同行
- 深港加速走廊：商业 / 演出 / 黑盒技术
- 南岭学院与展厅群：理论 / 展览 / 机构
- 离线渲染农场：制作 / 算力 / 技术维护
- 北方双年展工地：大型空间 / 制作团队 / 媒体
- 海外驻留港：驻留 / 国际网络 / 语言与制度

### Z：进入空间的深度

第三维不是立即做 3D，而是“界面深度”。

```text
LEVEL 0 — WORLD MAP
LEVEL 1 — LOCATION
LEVEL 2 — ACTIVITY PANEL
LEVEL 3 — LIVE SCENE / TEXT / SIMULATION
```

例如：

```text
World Map
  → 深港加速走廊
    → 黑盒测试场
      → Stage Forge
        → Signal Test Scene
```

这样以后 Level 1/2 可以替换成 2D/3D 场景，而 Core 不需要改变。

---

## 3. World Map

### 视觉原则

像 GT7 世界地图一样“抽象但可居住”，不要做 RPG 大地图。

地图上长期只显示 6–9 个主节点。

每个节点只显示：

- 图标
- 名称
- 1 个当前状态点
- 是否有新内容

例如：

```text
◎ CAFÉ             ● 新任务
▣ WORKBENCH         ▲ 项目可升级
◇ 榕树湾工作区      · 无新事件
◆ 深港加速走廊      ! 演出邀请
△ 南岭学院          ● Open Call
▦ STAGE FORGE       ▲ 新场景模板
```

地图本身可以使用动态背景：天气、昼夜、当前项目媒体、点云、城市扫描、演出视频等。

动态背景只负责“世界气氛”，不承担规则。

---

## 4. Café / Notebook

这是游戏的叙事中枢，也是 V0.4 文本流的正式归宿。

### Café 做什么

- 主 Menu Book
- Extra Menu / 支线
- 世界新闻
- 人物对话
- Open Call / 邀约
- 项目复盘
- 新地点介绍
- 新系统解锁

### Menu Book

不用传统 Quest Log，而是一本“创作任务书”。

每一本只包含 2–4 个目标：

```text
MENU 07 — 第一次真正的现场

□ 做出一个能持续运行 20 分钟的版本
□ 在任意黑盒空间完成一次 Signal Test
□ 留下一份故障记录

完成后：
解锁 Stage Forge / Live Scene Lv.2
获得：FIELD TEST 标签
```

主线不要求线性完成所有内容，只决定新系统和新区域何时开放。

### 文本布局

文本始终置于画面中央，宽度固定 620–760px。

人物、邮件、故障日志、系统提示共用 Narrative Renderer，但拥有不同 Skin。

不要再让文本被底部 Action Dock 压住。

---

## 5. Workbench

Workbench 是“车库 + Tuning Shop”，但对象不是汽车，而是作品生产能力。

### 不做完整电脑硬件模拟器

设备只保留能够改变玩法的分界线。

统一使用 Capability Tier，而不是厂商品牌和详细参数。

### Computer Platform

#### Desktop / x86 Workstation

特点：
- 可拆换 GPU
- 更适合高持续负载
- 更适合大型实时视觉 / UE / 本地模型 / 多输出
- 移动性差

#### Mobile / ARM Workstation

特点：
- 整机统一
- 移动与现场工作收益高
- 功耗低
- GPU / 扩展能力封顶更早

#### Linux / Utility Node

不是第三套玩家主机，而是后期辅助节点：服务器、渲染、网络、部署。

### GPU Tier

避免 RTX / AMD 品牌。

内部可沿用熟悉的数字逻辑，显示名则使用：

| Tier | 内部参考 | 游戏意义 |
|---|---:|---|
| G50 | xx50 | 基础实时图形，复杂场景有性能压力 |
| G60 | xx60 | 标准制作线，取消基础性能 Debuff |
| G70 | xx70 | 大部分实时媒体稳定运行 |
| G80 | xx80 | 大型场景 / 多输出 / 高分辨率收益 |
| G90 | xx90 | 极端工作负载 / 专业生产线 |

规则只判断 threshold：

```text
requiredGpuTier <= playerGpuTier
```

不要模拟 CUDA 核心、显存位宽等参数。

### Workbench Upgrade Slots

最多 5 个：

- Compute
- Display / Output
- Capture / Sensor
- Network
- Storage

玩家看到的永远是“这项升级让我能做什么”，而不是电脑配置表。

---

## 6. Project Machine

作品项目本身也应该像赛车一样有一个“性能页”。

但不要变成分数堆砌。

每个 Project 只显示 5 个能力：

- Stability 稳定性
- Fidelity 表现复杂度
- Portability 可部署性
- Interaction 交互能力
- Documentation 文档完整度

不同场景有门槛：

```text
小型展览：Stability 2 / Documentation 1
Live Stage：Stability 2 / Portability 2
大型机构展：Stability 3 / Documentation 3
多屏演出：Compute G70 + Output 3
```

玩家不是把所有数值刷满，而是为了当前项目选择不同 Build。

---

## 7. Stage Forge / Scenes Forge

这是作品未来最有差异化的核心系统。

### Stage Forge = Event Simulator

玩家进入：

- Club / Live
- Gallery
- Black Box
- Public Screen
- Immersive Room
- Outdoor / Temporary Site

选择自己的 Project Build，然后进入一段短模拟。

第一阶段完全可以是 2D：

```text
[舞台预览 / 动态背景]

Input      Video      Network
  ✓          ✓           !

现场状态：Audience 74 / Stability 62

EVENT:
主输出出现间歇性黑屏。

1. 切备用输出
2. 降低场景复杂度
3. 继续运行并观察
```

以后这个 Surface 可以替换成 Three.js / WebGPU / UE 导出的 3D 场景。

---

## 8. Location System

地点不是“事件分类器”，而是世界状态容器。

Location 至少拥有：

```ts
id
name
regionId
position: {x, y}
adjacentLocationIds[]
visualTheme
availableFacilities[]
conditions[]
localEventTags[]
travelCost
unlockRule
```

Sub-location 可以拥有自己的 Activity Surface。

例如：

```text
榕树湾工作区
├─ Shared Studio      → Workbench / Social
├─ River Diner        → Café-like conversation
└─ Loading Dock       → Used Equipment / Transport
```

---

## 9. Exchange / Shop

商店不要做商城。

它应该像 GT 的 dealership / tuning shop 一样，是一个“可理解当前生产技术”的地方。

### 三类渠道

- New Equipment：稳定，但贵
- Used Equipment：便宜，可能带 Condition / History
- Salvage / Borrow：短期、关系型、风险型

### 虚构命名

不要仿品牌 Logo，也不要做一眼对应苹果/微软的假商标。

直接描述技术类别会更优雅：

- x86 Desktop Workstation
- ARM Mobile Workstation
- Compact Render Node
- Portable GPU Unit
- Multi-output Interface
- Depth Sensor
- Tracking Camera
- Network Router

单个型号可用制造批次：

`X86-G60 / 2026`
`ARM-M3 / Mobile Studio`
`Render Node R70`

---

## 10. Attention

V0.4 的 Attention 保留。

但它从“唯一主游戏”降级成世界地图上的行动预算。

每个 Cycle：6 Attention。

- 地图移动通常 0
- Café 对话通常 0
- 查看工作台 0
- 真正工作 / 制作 / 社交 / 申请 1–3
- Stage / Exhibition 通常直接结算 2–4

因此玩家可以自由浏览，但不能无限做事。

---

## 11. Citizen Sleeper 式 Clock，不使用骰子

本项目不应该把核心变成随机骰子。

借用 Clock 概念：

```text
PROJECT CLOCK
██████░░ 6/8

OPEN CALL DEADLINE
████████░ 8/9

CLIENT PATIENCE
████░░ 4/6
```

Clock 给世界压力和长期推进。

结果随机只作为少量 uncertainty，不作为主控制器。

---

## 12. Cards

卡片重新引入，但只作为“对象表示”，不是铺满桌面的操作方式。

四种 Card：

- Project Card
- Location Card
- Opportunity Card
- Media / Archive Card

卡片可以左右滑动、翻面、展开。

卡片不是背包物品。

卡片的价值是：让玩家一眼知道“这个世界现在有哪些对象值得关心”。

---

## 13. PC / Mobile Layout

### Desktop

```text
┌──────────────────────────────────────────┐
│ Logo / Profile        Attention / Cash   │
├──────────────────────────────────────────┤
│                                          │
│              WORLD / SCENE               │
│                                          │
│         [central narrative panel]        │
│                                          │
├─────────────┬─────────────┬──────────────┤
│ Prev / Map  │ Main Action │ Next / Info  │
└─────────────┴─────────────┴──────────────┘
```

中央始终不会被 Bottom Dock 遮挡。

### Mobile

- 地图占上方 40–50%
- 当前 Location / Scene Card 占中间
- Action Sheet 从底部弹出
- 世界状态用顶部两三个小 indicator
- 横向 swipe 在相邻 Location / Cards 间切换

不要把桌面右侧栏硬塞到手机底部。

---

## 14. Boot / Profile / Live Service Shell

### Boot

1. Black screen
2. studio mark
3. NEW MEDIA ARTIST SIMULATOR
4. loading manifest
5. profile selection
6. World Map

### Profile

第一版只有：

- Profile ID
- Save Slot
- Display Name
- Starting Practice
- Starting Kit

“身份认证”先只是 Profile/Save Protocol，不接实名。

### Home Feed

World Map 可以有一个小的 Update / News Ribbon：

- NEW OPEN CALL
- NEW LIVE EVENT
- CONTENT PACK 0.5.2
- WEEKLY WORLD CONDITION

它是内容入口，不是手游签到系统。

---

## 15. 初始包

玩家开始时只选择一种 Starting Kit，不选几十项属性。

### MOBILE STUDIO

- ARM Mobile Workstation
- Portable Display Adapter
- Small Storage
- +1 Portability

### DESKTOP STUDIO

- x86 Desktop G60
- Standard Display Output
- Large Storage
- +1 Compute

### FIELD KIT

- Entry Laptop
- Sensor / Capture Kit
- Router
- +1 Interaction / Network

三者都能完成主线，不存在错误职业。

---

## 16. 第一章 Menu Books

### 01 — BOOT

- 选择起始工作方式
- 第一次进入榕树湾工作区
- 打开 Workbench

解锁：Café

### 02 — SIGNAL

- 找到一份可用素材
- 制作 Project Prototype
- 运行第一次本地测试

解锁：Project Machine

### 03 — OUTSIDE

- 在 Café 接到一次外部机会
- 前往一个新地点
- 做一次 Field Action

解锁：深港加速走廊

### 04 — LIVE

- 把项目带入黑盒测试场
- 完成一次 Stage Forge Simulation
- 留下一个 Failure / Media Record

解锁：Stage Forge Lv.2

### 05 — PUBLIC

- 在 Gallery / Live / Web 三种路径里任选一条公开项目
- 接受一次外部评价
- 回 Café 做项目复盘

第一章结束。

---

## 17. 设计守则

1. 一个空间只提供一种主要行为。
2. 同一时间屏幕上最多出现 3 个主要选择。
3. 地图负责“去哪”，Café 负责“为什么去”，Workbench 负责“带什么去”，Stage Forge 负责“到了以后发生什么”。
4. 所有系统最终都要回写 Project / World / Archive。
5. 设备系统使用门槛和能力，不模拟真实参数表。
6. 浏览不消耗 Attention，行动才消耗。
7. 地图从第一分钟存在；新章节只解锁节点，不替换地图。
8. Card 是对象，不是库存。
9. Text 是 Scene，不是页面填充物。
10. 3D 以后替换 Surface，不替换 Core。
