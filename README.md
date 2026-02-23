# 新媒体艺术家模拟器

[![Version](https://img.shields.io/badge/version-2026-blue)](https://github.com/ewanqian/new-media-artist-simulator)
[![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-green)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

AI时代新媒体艺术家的生涯模拟器——基于布尔迪厄艺术场域理论，用黑色幽默解构当代艺术圈。

[在线体验](https://ewanqian.github.io/new-media-artist-simulator/) · [项目概览](./PROJECT_OVERVIEW.md)

---

## 一句话介绍

一个基于游戏化的生涯模拟器，玩家扮演新媒体艺术家，在理论深度、学术资本、范式突破、研究经费之间做选择，体验AI时代艺术创作的主体性危机。

---

## 模拟器生态

本项目包含一个核心模拟器和多个扩展模拟器：

| 模拟器 | 描述 | 状态 |
|--------|------|------|
| **艺术家生涯模拟器** | 核心模块，体验新媒体艺术家职业生涯 | ✅ 已实现 |
| **序章Demo** | 线性引导+开放探索的Demo关卡 | 🔄 开发中 |
| **特展模拟器** | 策展、空间设计、作品选择、开幕运营 | 🔄 概念设计 |
| **艺术品拍卖模拟器** | 市场竞价、收藏家行为、资本博弈 | 🔄 概念设计 |
| **艺术博览会模拟器** | 多展位管理、交易博弈、行业生态 | 🔄 概念设计 |

---

## 艺术流派与子集

项目归并了三个媒体艺术仓库作为子集/研究方向：

| 仓库 | 定位 |
|------|------|
| [chaos-media-art](./SUBSETS/chaos-media-art/) | 混沌媒体艺术 - 失控、错误、系统脆弱性作为创造性资源 |
| [less-media-art](./SUBSETS/less-media-art/) | 少媒体艺术 - AI时代创作伦理实验，通过约束重获主体性 |
| [ubiquitous-media-art](./SUBSETS/ubiquitous-media-art/) | 泛在媒体艺术 - 计算、网络、智能无处不在时代的艺术框架 |

---

## 序章Demo

序章是本项目的Demo版本，提供线性引导+开放探索的体验：

### 核心特性

- **角色路径**：8条预设路径（毕业生/AI转行/自由职业/传统转型/海归/独立艺术家/机构从业/科技跨界）
- **派系系统**：9大艺术派系，维度标签系统
- **NPC互动**：完整的角色设定，真实的对话与任务
- **轨迹系统**：记录玩家行为，支持上传分享，玩家可转化为NPC

### 场景设定

- **地域**：虚构的榕州市榕树湾艺术区（基于真实艺术生态）
- **角色**：毒舌前辈、策展人、收藏家、AI助手等6+ NPC
- **玩法**：15-60分钟体验，完成第一个艺术创作

### 轨迹系统

玩家可以保存游玩轨迹，上传至线上平台，生成艺术生态行为网络。玩家轨迹可转化为NPC，实现UGC循环。

详见 [PROLOGUE/DESIGN_DOCUMENT.md](./PROLOGUE/DESIGN_DOCUMENT.md)

---

## 快速开始

### 在线体验

直接访问：https://ewanqian.github.io/new-media-artist-simulator/

### 本地运行

```bash
git clone https://github.com/ewanqian/new-media-artist-simulator.git
cd new-media-artist-simulator

# 艺术家生涯模拟器（核心游戏）
cd new-media-artist-simulator
node server.js
# 或直接打开 index.html
```

---

## 目录结构

```
new-media-artist-simulator/
│
├── new-media-artist-simulator/   # 艺术家生涯模拟器（核心游戏）
│   ├── index.html
│   ├── server.js
│   ├── content/                  # 游戏数据
│   │   ├── spaces/
│   │   ├── projects/
│   │   └── events/
│   ├── js/
│   └── css/
│
├── PROLOGUE/                      # 序章Demo（开发中）
│   ├── DESIGN_DOCUMENT.md        # 设计总纲
│   ├── CHARACTERS/                # NPC角色设定
│   │   ├── NPC_001_ZHANG_DEMAO.md
│   │   └── NPC_002_WANG_MINGYUAN.md
│   ├── LOCATIONS/                 # 地点设定
│   ├── FACTIONS/                  # 派系系统
│   ├── ITEMS/                     # 物品系统
│   ├── PATHS/                    # 角色路径
│   └── TRAJECTORY/                # 轨迹系统
│
├── GAME/                          # 扩展模拟器
│   └── Simulators/
│       ├── EXHIBITION_SIMULATOR.md
│       ├── AUCTION_SIMULATOR.md
│       └── ART_FAIR_SIMULATOR.md
│
├── SETTINGS/                      # 设定集（JSON→Markdown）
│   ├── spaces/                    # 地点设定（13个）
│   ├── projects/                  # 项目设定（10个）
│   ├── events/                    # 事件设定
│   ├── preparations/              # 准备设定
│   ├── income/                    # 收入设定
│   ├── schools/                   # 学派设定
│   └── SPECIAL_EVENTS/           # 特殊事件系统
│       ├── realistic/
│       ├── absurd/
│       └── satirical/
│
├── STUDIES/                       # 理论库/研究文档（18个）
│   ├── THEORETICAL_FRAMEWORK.md
│   ├── VALUE_CRITIQUE.md
│   ├── DESIGN_CRITIQUE.md
│   └── ...
│
├── SUBSETS/                       # 子集仓库
│   ├── chaos-media-art/
│   ├── less-media-art/
│   └── ubiquitous-media-art/
│
└── archive/                       # 项目归档
```

---

## 核心系统

### 八维数值系统

| 维度 | 含义 | 场域对应 |
|------|------|----------|
| 理论深度 | 对艺术史、媒介理论的掌握 | 文化资本 |
| 学术资本 | 展览、发表、奖项、人脉 | 符号资本 |
| 范式突破 | 媒介/观念/形式的创新能力 | 先锋性 |
| 研究经费 | 可支配资金总量 | 经济资本 |
| 焦虑指数 | 生存压力、心理困境 | 心理状态 |
| 讽刺值 | 对体制荒诞性的洞察 | 批判性 |
| 现实感 | 对行业生态的认知 | 生存能力 |
| 幽默度 | 轻松处理困境的能力 | 心理韧性 |

### 三层文本结构

每一个选项都包含三层文本：正式话语 → 通俗翻译 → 讽刺评论

### 多调性事件系统

| 等级 | 特征 |
|------|------|
| 现实级 | 基于真实艺术生态，可验证 |
| 荒诞级 | 离谱但有趣，意外惊喜 |
| 讽刺级 | 黑色幽默，体制批判 |

### 派系与标签系统

玩家可以选择艺术派系，每种选择带有标签，影响数值变化：

| 派系 | 标签 | 特色 |
|------|------|------|
| 媒介反思派 | #媒介批判 #技术哲学 #后人类 | 技术与人性 |
| 生成混沌派 | #生成艺术 #混沌 #涌现 | AI涌现性 |
| 少媒体派 | #约束 #本地 #反思 | AI时代创作伦理 |
| 混沌媒体派 | #错误 #脆弱性 #系统 | 失控与错误 |
| 泛在媒体派 | #泛在计算 #网络 #智能 | 无处不在的计算 |

---

## 项目状态

| 模块 | 状态 |
|------|------|
| 艺术家生涯模拟器 | ✅ 已实现 |
| 序章Demo | 🔄 开发中 |
| 地点设定 (13个) | ✅ 已实现 |
| 项目设定 (10个) | ✅ 已实现 |
| 特殊事件系统 | 🔄 设计完成 |
| 轨迹系统 | 🔄 设计完成 |
| 特展模拟器 | 🔄 概念设计 |
| 拍卖模拟器 | 🔄 概念设计 |
| 博览会模拟器 | 🔄 概念设计 |

---

## 关联项目

| 项目 | 描述 |
|------|------|
| [VIRTURA-Team](https://github.com/VIRTURA-Team) | 公共组织 |
| [VIRTURA-SpacePort](https://github.com/VIRTURA-SpacePort) | 生态容器 |
| [VIRTURA-Newsroom](https://github.com/VIRTURA-Newsroom) | 研究文章全库 |

---

## 许可证

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
