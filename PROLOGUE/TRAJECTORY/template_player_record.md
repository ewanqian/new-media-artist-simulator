# 玩家轨迹记录模板

> **版本**: v2.0
> **用途**: 记录玩家游戏过程数据

---

## 基础信息

```yaml
player_record:
  # 唯一标识
  player_id: "uuid_v4"
  
  # 玩家昵称（可选）
  nickname: "玩家昵称"
  
  # 使用的角色路径ID
  avatar: "PATH_001"
  
  # 时间信息
  start_time: "2026-02-23T10:00:00Z"
  end_time: "2026-02-23T11:30:00Z"
  total_duration: 5400  # 秒
  
  # 游戏版本
  version: "2.0-demo"
```

---

## 轨迹数据结构

### 1. 空间访问记录

```yaml
trajectory:
  locations_visited:
    - location_id: "SH_LOC_001"
      name: "M50创意园"
      visit_count: 3
      total_duration: 1800  # 秒
      first_visit: "2026-02-23T10:15:00Z"
      last_visit: "2026-02-23T11:00:00Z"
      behaviors_performed:
        - "creative_studio"  # 2次
        - "social_coffee"    # 1次
        
    - location_id: "SH_LOC_003"
      name: "西岸艺术中心"
      visit_count: 1
      total_duration: 600
      behaviors_performed:
        - "academic_lecture"
```

### 2. 项目/作品完成记录

```yaml
projects_completed:
  - project_id: "PRJ_001"
    name: "AI协作创作实验"
    type: "个人项目"
    duration: 1200  # 秒
    start_time: "2026-02-23T10:30:00Z"
    outcome: "成功"
    quality: 75  # 0-100
    outputs:
      - "WORK_001: 数字生成作品《涌现》"
      
  - project_id: "PRJ_002"
    name: "周末工作坊"
    type: "学习项目"
    duration: 7200
    outcome: "完成"
    skill_gained: ["creative_programming"]
```

### 3. 事件触发记录

```yaml
events_triggered:
  - event_id: "EVT_001"
    name: "策展人邀请"
    type: "随机事件"
    trigger_time: "2026-02-23T10:45:00Z"
    choice: "接受"  # 玩家选择
    choice_index: 0
    effects:
      # 数值变化
      academic: +15
      funding: -5000
      anxiety: +5
      # 关系变化
      relationships:
        - npc_id: "NPC_002"
          change: +10
    location: "西岸艺术中心"
    
  - event_id: "EX_GROUP_001"
    name: "主题群展"
    type: "展览事件"
    trigger_time: "2026-02-23T11:00:00Z"
    choice: "参加"
    effects:
      fame: +30
      money: +5000
      relationships:
        - npc_id: "NPC_005"
          change: +5
```

### 4. 对话互动记录

```yaml
dialogues:
  - npc_id: "NPC_001"
    npc_name: "张德茂"
    topic: "艺术创作"
    trigger_time: "2026-02-23T10:20:00Z"
    choices_made: 
      - "讨论AI创作"
      - "询问职业建议"
    response_quality: "积极"
    relationship_change: +5
    
  - npc_id: "NPC_003"
    npc_name: "林雅婷"
    topic: "驻留申请"
    trigger_time: "2026-02-23T10:35:00Z"
    choices_made:
      - "请教经验"
    relationship_change: +8
```

### 5. 社交关系变化

```yaml
relationships:
  - npc_id: "NPC_001"
    npc_name: "张德茂"
    initial_level: 20
    final_level: 25
    interactions: 3
    key_moments:
      - "初次见面"
      - "讨论创作方向"
      
  - npc_id: "NPC_003"
    npc_name: "林雅婷"
    initial_level: 10
    final_level: 18
    interactions: 2
    key_moments:
      - "请教驻留经验"
```

### 6. 作品生成记录

```yaml
works_created:
  - work_id: "WORK_001"
    title: "涌现"
    type: "生成艺术"
    medium: ["数字绘画", "AI生成"]
    style_tags: ["#生成艺术", "#AI协作"]
    faction_tags: ["F002", "F004"]
    tech_stack: ["Python", "p5.js"]
    created_at: "2026-02-23T10:50:00Z"
    creation_duration: 600
    quality: 75
    description: "基于GPT-4涌现性特征的生成艺术作品"
    exhibited: false
    sold: false
```

### 7. 机构交互记录

```yaml
institutions_interacted:
  - institution_id: "INST_001"
    name: "北画廊"
    type: "商业画廊"
    interactions: 2
    outcomes:
      - "建立初步联系"
      - "了解代理机制"
    relationship_level: 15
    
  - institution_id: "INST_002"
    name: "上海当代艺术博物馆"
    type: "美术馆"
    interactions: 1
    outcomes:
      - "参加学术讲座"
    relationship_level: 10
```

### 8. 关键决策记录

```yaml
key_decisions:
  - decision_id: "DEC_001"
    name: "职业方向选择"
    description: "选择接受商业项目还是学术研究"
    trigger_time: "2026-02-23T11:10:00Z"
    choice: "学术研究"
    choice_index: 1
    consequences:
      - "学术资本+20"
      - "经济资本-5000"
      - "焦虑+10"
      - "解锁学术路线后续事件"
    importance: "高"  # 高/中/低
```

### 9. 数值变化轨迹

```yaml
stat_changes:
  # 初始数值
  initial:
    theory: 65
    technique: 45
    academic: 15
    fame: 20
    funding: 30000
    anxiety: 45
    energy: 80
    inspiration: 60
    
  # 最终数值
  final:
    theory: 70
    technique: 50
    academic: 30
    fame: 35
    funding: 27500
    anxiety: 50
    energy: 45
    inspiration: 55
    
  # 变化记录
  timeline:
    - time: "2026-02-23T10:15:00Z"
      event: "喝咖啡"
      changes:
        energy: -10
        funding: -30
        
    - time: "2026-02-23T10:30:00Z"
      event: "创作作品"
      changes:
        technique: +5
        inspiration: -15
        energy: -20
        
    - time: "2026-02-23T10:45:00Z"
      event: "策展人邀请"
      changes:
        academic: +15
        funding: -5000
        anxiety: +5
```

### 10. 结局数据

```yaml
ending:
  type: "学术路线"
  summary: "玩家选择了学术路线，参加了王教授的策展项目"
  achievements:
    - "第一次完成个人作品"
    - "策展人认可"
    - "建立首个机构联系"
  rank: "入门艺术家"
  play_count: 1
  total_play_time: 5400
  completion_rate: 0.15  # 15%完成度
```

---

## 导出格式

### JSON格式（机器读取）
```json
{
  "player_id": "uuid",
  "trajectory": {
    "locations": [...],
    "events": [...],
    "dialogues": [...]
  }
}
```

### Markdown格式（人类阅读）
见 `PLAYER_REPORT_TEMPLATE.md`

---

## 使用说明

1. **游戏内记录**: 每个行为/事件自动记录到本地存储
2. **定期保存**: 每5分钟自动保存
3. **结束保存**: 游戏结束时保存完整轨迹
4. **可选上传**: 玩家可选择上传轨迹到线上平台

---

*模板版本: 2.0*
