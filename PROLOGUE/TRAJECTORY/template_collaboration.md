# 协作记录模板

> **用途**: 记录多人协作游戏过程

---

## 基础信息

```yaml
collaboration_record:
  session_id: "uuid_v4"
  session_type: "collaboration"  # exhibition / project / institution
  version: "2.0"
  
  # 参与者
  participants:
    - player_id: "PLAYER_001"
      nickname: "艺术家A"
      avatar: "PATH_001"
      role: "策展人"
      contribution: 0.4  # 贡献比例
      
    - player_id: "PLAYER_002"
      nickname: "艺术家B"
      avatar: "PATH_002"
      role: "艺术家"
      contribution: 0.6
      
  # 时间
  start_time: "2026-02-23T14:00:00Z"
  end_time: "2026-02-23T16:30:00Z"
  duration: 9000  # 秒
```

---

## 协作类型

### 类型1: 联展策划

```yaml
exhibition_collaboration:
  project_name: "《技术的边界》联展"
  
  # 角色分配
  roles:
    - player_id: "PLAYER_001"
      role: "策展人"
      responsibilities:
        - "确定展览主题"
        - "邀请艺术家"
        - "协调场地"
        
    - player_id: "PLAYER_002"
      role: "艺术家"
      responsibilities:
        - "创作参展作品"
        - "参与布展"
        
    - player_id: "PLAYER_003"
      role: "宣传"
      responsibilities:
        - "社交媒体运营"
        - "邀请媒体"
        
  # 展览信息
  exhibition:
    name: "《技术的边界》联展"
    venue: "西岸艺术中心"
    duration: "2周"
    opening_date: "2026-03-15"
    
  # 成果
  outcomes:
    exhibition_held: true
    visitors: 500
    works_exhibited: 8
    works_sold: 3
    revenue: 15000
    expenses: 8000
    net_profit: 7000
    
  # 分配
  profit_distribution:
    - player_id: "PLAYER_001"
      share: 0.4
      amount: 2800
      
    - player_id: "PLAYER_002"
      share: 0.4
      amount: 2800
      
    - player_id: "PLAYER_003"
      share: 0.2
      amount: 1400
```

### 类型2: 艺术项目合作

```yaml
project_collaboration:
  project_name: "AI协作装置"
  
  # 角色分配
  roles:
    - player_id: "PLAYER_001"
      role: "概念设计"
      responsibilities:
        - "确定创作概念"
        - "艺术方向把控"
        
    - player_id: "PLAYER_002"
      role: "技术实现"
      responsibilities:
        - "编写代码"
        - "硬件搭建"
        
  # 作品信息
  work:
    title: "人机共舞"
    type: "互动装置"
    medium: ["AI生成", "传感器", "投影"]
    tech_stack: ["TouchDesigner", "Python", "Arduino"]
    
  # 成果
  outcomes:
    work_completed: true
    exhibited: true
    exhibition: "上海双年展"
    sold: false
    
  # 知识产权
  ip_shared: true
  ip_agreement: "共同拥有"
```

### 类型3: 机构共建

```yaml
institution_collaboration:
  institution_name: "新媒体艺术空间"
  institution_type: "艺术空间"
  
  # 创始团队
  founders:
    - player_id: "PLAYER_001"
      role: "主理人"
      investment: 30000
      
    - player_id: "PLAYER_002"
      role: "艺术总监"
      investment: 20000
      
    - player_id: "PLAYER_003"
      role: "运营"
      investment: 10000
      
  # 机构信息
  details:
    location: "M50创意园"
    focus: ["新媒体艺术", "AI艺术"]
    style_tags: ["F002", "F004"]
    
  # 运营数据
  operations:
    first_year_revenue: 50000
    first_year_expenses: 40000
    events_hosted: 12
    exhibitions_held: 6
    
  # 决策记录
  decisions:
    - decision: "空间命名"
      proposed_by: "PLAYER_001"
      vote: "多数通过"
      
    - decision: "第一个展览主题"
      proposed_by: "PLAYER_002"
      vote: "一致同意"
```

---

## 协作交互记录

```yaml
interactions:
  # 实时交流
  chat_messages:
    - sender: "PLAYER_001"
      content: "我想到一个主题: 技术与人性"
      timestamp: "2026-02-23T14:15:00Z"
      
    - sender: "PLAYER_002"
      content: "好主意! 我可以用AI来实现"
      timestamp: "2026-02-23T14:16:00Z"
      
  # 决策投票
  votes:
    - decision: "展览场地选择"
      options: ["西岸艺术中心", "M50", "线上"]
      votes:
        PLAYER_001: "西岸艺术中心"
        PLAYER_002: "西岸艺术中心"
        PLAYER_003: "M50"
      result: "西岸艺术中心 (2:1)"
```

---

## 协作成果统计

```yaml
statistics:
  total_collaborations: 3
  
  by_type:
    exhibition: 1
    project: 1
    institution: 1
    
  success_rate: 0.67
  
  average_participants: 2.5
  
  total_revenue: 22000
  total_expenses: 12000
```

---

## 导出与分享

### 协作报告

每个协作完成后，生成协作报告，包含:
- 参与者贡献
- 成果展示
- 经验教训

### 排行榜

线上平台展示:
- 最成功协作
- 最多参与玩家
- 最高收益协作

---

*模板版本: 2.0*
