# 新媒体艺术家模拟器 - 序章设定文档

> **版本**: 2026主干版 - Demo
> **状态**: 开发中
> **更新**: 2026年2月

---

## 一、地域生态设计

### 1.1 国内艺术生态（2025-2026）

| 城市 | 艺术区 | 特点 | 适用路径 |
|------|--------|------|----------|
| **榕州市**（虚构） | 榕树湾艺术区 | 南方新媒体艺术重镇 | 毕业生/转行 |
| **嘉湖市**（虚构） | 东栅创意园 | 上海周边，传统与当代交融 | 自由职业 |
| **海城**（虚构） | 海城艺术湾区 | 北方当代艺术中心 | 传统转型 |
| **深港**（虚构） | 深港创新走廊 | 科技艺术融合 | AI转行 |

### 1.2 海外艺术生态

| 国家/地区 | 特点 | 适用路径 |
|-----------|------|----------|
| **英国（伦敦/曼彻斯特）** | 学术氛围浓厚 | 留学派 |
| **美国（纽约/洛杉矶）** | 市场成熟 | 科技艺术 |
| **日本（东京/大阪）** | 注重工艺 | 传统转型 |
| **德国（柏林）** | 便宜，当代艺术重镇 | 独立艺术家 |

---

## 二、角色路径设计

### 预设路径

| ID | 路径名称 | 身份 | 初始状态 | 适用场景 |
|----|----------|------|----------|----------|
| PATH_001 | 艺术学院毕业 | 林晓，应届毕业生 | 学术高/经济低 | 基础体验 |
| PATH_002 | AI行业转行 | 张磊，前工程师 | 技术强/学术弱 | 科技艺术 |
| PATH_003 | 自由职业转型 | 王芳，设计师 | 商业强/学术中 | 生存挑战 |
| PATH_004 | 传统艺术家转型 | 周婷，国画家 | 理论强/技术弱 | 跨界挑战 |
| PATH_005 | 海归艺术家 | 陈墨，RCA毕业 | 国际视野/本土弱 | 留学归来 |
| PATH_006 | 独立艺术家 | 赵小山，自由创作 | 无固定资本 | 极端挑战 |

---

## 三、派系系统设计

### 核心派系

| ID | 名称 | 特征 | 标签 |
|----|------|------|------|
| F001 | 媒介反思派 | 技术与人性 | #媒介批判 #后人类 |
| F002 | 生成混沌派 | AI涌现性 | #生成艺术 #混沌 |
| F003 | 空间沉浸派 | 空间与身体 | #沉浸式 #身体 |
| F004 | 代码原生派 | 代码即艺术 | #创意编程 #开源 |
| F005 | 社会介入派 | 艺术介入社会 | #行动主义 #公共 |
| F006 | 跨媒介融合派 | 打破边界 | #跨媒介 #实验 |
| F007 | 少媒体派 | 约束创作 | #约束 #反思 |
| F008 | 混沌媒体派 | 失控与错误 | #错误 #脆弱性 |
| F009 | 泛在媒体派 | 无处不在 | #泛在计算 #网络 |

---

## 四、维度标签系统

### 地点/项目/事件/收入标签表

| 维度 | 标签类型 | 示例 |
|------|----------|------|
| 空间 | #学术空间 #商业空间 #混合空间 #地下空间 | 影响资本倾向 |
| 项目 | #AI协作 #数据可视化 #互动装置 #概念艺术 | 影响范式突破 |
| 事件 | #学术认可 #商业机会 #技术突破 #舆论危机 | 触发条件与效果 |
| 收入 | #学术资助 #商业外包 #作品销售 #教学兼职 | 资金来源与持续性 |

---

## 五、玩家轨迹系统（PLAYER TRACKING SYSTEM）

### 5.1 核心功能

**目标**：记录玩家行为，生成艺术生态轨迹网络，支持玩家生成内容（UGC）循环

### 5.2 轨迹记录格式

```yaml
player_record:
  # 基础信息
  player_id: "uuid_v4"
  nickname: "玩家昵称"
  avatar: "角色路径ID"
  start_time: "2026-02-23T10:00:00Z"
  end_time: "2026-02-23T11:30:00Z"
  total_duration: 5400  # 秒
  
  # 轨迹数据
  trajectory:
    # 1. 空间访问记录
    locations_visited:
      - location_id: "LOC_001"
        name: "榕树湾艺术区B区"
        visit_count: 3
        duration: 1800
        
    # 2. 项目完成记录
    projects_completed:
      - project_id: "PRJ_001"
        name: "AI协作创作实验"
        duration: 1200
        outcome: "成功"
        
    # 3. 事件触发记录
    events_triggered:
      - event_id: "EVT_001"
        name: "策展人邀请"
        choice: "接受"
        effects:
          academic: +15
          funding: -5000
          
    # 4. 对话互动记录
    dialogues:
      - npc_id: "NPC_001"
        topic: "艺术创作"
        choices: ["AI创作讨论", "装置入门"]
        
    # 5. 社交关系
    relationships:
      - npc_id: "NPC_001"
        level: 30  # 友好度
        interactions: 5
        
  # 6. 作品生成记录（玩家创作）
  works_created:
    - work_id: "WORK_001"
      title: "我的第一件作品"
      type: "互动装置"
      description: "基于AI协作的声光装置"
      style_tags: ["#生成艺术", "#AI协作"]
      faction_tags: ["F002", "F004"]
      
  # 7. 机构交互记录
  institutions_interacted:
    - institution_id: "INST_001"
      name: "蓝岸画廊"
      interactions: 2
      outcome: "建立联系"
      
  # 8. 决策记录（关键选择）
  key_decisions:
    - decision_id: "DEC_001"
      description: "选择接受商业项目还是学术研究"
      choice: "商业项目"
      consequence: "获得资金但学术资本下降"
      
  # 9. 数值变化轨迹
  stat_changes:
    theory: 65  # 初始值
    academic: 15
    paradigm: 25
    funding: 30000
    anxiety: 45
    
  # 10. 结局数据
  ending:
    type: "学术路线"
    summary: "玩家选择了学术路线，参加了王教授的策展项目"
    achievements: ["第一次展览", "策展人认可"]
    rank: "入门艺术家"
```

### 5.3 轨迹上传与分享

#### 5.3.1 本地保存

```bash
# 保存为JSON文件
./save_trajectory player_id.json

# 保存为Markdown报告
./save_report player_id.md
```

#### 5.3.2 线上平台

```
https://virtura.art/trajectory/[player_id]
```

**平台功能**：
1. **轨迹可视化**
   - 时间线视图
   - 场域位置图
   - 资本变化图

2. **数据分析**
   - 行为模式分析
   - 场域偏好分析
   - 决策风格分析

3. **社交功能**
   - 轨迹分享
   - 轨迹对比
   - 轨迹排名

### 5.4 玩家变成NPC机制

#### 5.4.1 转化条件

| 条件 | 要求 |
|------|------|
| 完成序章 | 是 |
| 轨迹完整度 | >80% |
| 作品数量 | >=1 |
| 社交互动数 | >=5 |

#### 5.4.2 转化后的NPC属性

```yaml
generated_npc:
  # 从轨迹继承
  origin: "玩家轨迹生成"
  player_id: "原始玩家ID"
  
  # 生成属性
  personality:
    # 基于对话选择推断
    traits: ["理性", "重视学术", "社交活跃"]
    communication_style: "温和但有主见"
    
  # 从作品推断艺术风格
  art_style:
    preferred_factions: ["F002", "F004"]  # 派系标签
    themes: ["AI", "技术", "互动"]
    mediums: ["装置", "影像"]
    
  # 从社交推断人脉
  connections:
    # 互动过的NPC
    npcs: ["NPC_001", "NPC_002"]
    institutions: ["INST_001"]
    
  # 从决策推断价值观
  values:
    academic_vs_commercial: 0.7  # 0=完全商业, 1=完全学术
    risk_tolerance: 0.5  # 风险承受度
    innovation_preference: 0.8  # 创新偏好
```

#### 5.4.3 交互方式

**相遇方式**：
- 新玩家在游玩时可能遇到"某位资深艺术家"
- 该角色由真实玩家的轨迹生成
- 带有真实玩家的决策风格

**对话内容**：
- 基于原始玩家的选择模式生成
- 保持一致的价值观和偏好
- 可以谈论"自己的创作经历"

### 5.5 多人协作模式

#### 5.5.1 协作场景

```
场景1：联展策划
- 多个玩家共同策划一个展览
- 每人负责不同板块（策展/场地/宣传/销售）
- 需要协调资源和决策

场景2：艺术项目合作
- 玩家A负责概念，玩家B负责技术实现
- 协作完成一件作品
- 作品可以进入游戏

场景3：机构共建
- 玩家共同创建一个艺术空间
- 每人投资不同资源
- 共同决定发展方向
```

#### 5.5.2 协作记录

```yaml
collaboration_record:
  session_id: "uuid"
  participants: ["player_1", "player_2", "player_3"]
  
  project:
    name: "联展《技术的边界》"
    roles:
      player_1: "策展人"
      player_2: "艺术家"
      player_3: "宣传"
      
  outcomes:
    exhibition_held: true
    visitors: 500
    works_sold: 3
    revenue: 15000
    
  artifacts:
    # 共同创作的作品
    collaborative_works:
      - title: "技术的边界"
        creators: ["player_1", "player_2"]
        description: "AI与人类协作的互动装置"
```

---

## 六、作品与机构生成系统

### 6.1 玩家作品格式

```yaml
player_work:
  work_id: "WORK_UUID"
  
  # 基础信息
  title: ""
  artist: "玩家ID或生成NPC"
  created_at: "时间戳"
  medium: ["互动装置", "生成艺术"]
  
  # 风格标签
  style_tags:
    - faction_tags: ["F002", "F004"]
    - theme_tags: ["AI", "技术", "互动"]
    - mood_tags: ["压抑", "冷静"]
    
  # 技术实现
  tech_stack: ["TouchDesigner", "Python", "Arduino"]
  
  # 描述（玩家输入或AI生成）
  description: ""
  
  # 展览历史
  exhibition_history:
    - exhibition: "《技术的边界》联展"
      date: "2026-03-15"
      sales: 5000
      
  # 评价数据
  reception:
    academic_reception: "策展人好评"
    public_reception: "观众互动积极"
    market_reception: "售出"
```

### 6.2 玩家创建机构格式

```yaml
player_institution:
  institution_id: "INST_UUID"
  
  # 基础信息
  name: ""
  type: ["画廊", "工作室", "艺术空间"]
  location: "地点ID"
  
  # 创始团队
  founders:
    - player_id: "玩家1"
      role: "主理人"
    - player_id: "玩家2"
      role: "艺术总监"
      
  # 运营方向
  direction:
    focus: ["新媒体艺术", "AI艺术"]
    style_tags: ["F002", "F004"]
    
  # 历史活动
  activities:
    - type: "展览"
      name: "开馆展"
      date: "2026-06-01"
      
  # 财务数据
  finances:
    initial_capital: 50000
    current_balance: 35000
    revenue_sources: ["作品销售", "场地租赁"]
```

---

## 七、设计原则

1. **真实性**：所有设定基于2025-2026年真实艺术生态
2. **原创性**：所有地名、机构名、人物名完全原创
3. **系统性**：维度标签形成完整网络
4. **可扩展性**：支持自定义角色和新派系
5. **场域理论**：每个设定都对应布尔迪厄场域逻辑
6. **玩家生成**：轨迹系统支持UGC循环

---

## 八、目录结构

```
PROLOGUE/
├── DESIGN_DOCUMENT.md           # 本设计文档
│
├── CHARACTERS/
│   ├── NPC_001_ZHANG_DEMAO.md  # 老炮张（已完成）
│   ├── NPC_002_WANG_MINGYUAN.md # 王教授（已完成）
│   ├── NPC_003_xxx.md          # 待创建
│   └── ...
│
├── LOCATIONS/
│   └── ...
│
├── FACTIONS/
│   └── ...
│
├── ITEMS/
│   └── ...
│
├── TRAJECTORY/
│   ├── TEMPLATE_PLAYER_RECORD.md
│   ├── TEMPLATE_COLLABORATION.md
│   └── PLATFORM_SPEC.md
│
└── PATHS/
    └── ...
```

---

*本文档持续更新中*
