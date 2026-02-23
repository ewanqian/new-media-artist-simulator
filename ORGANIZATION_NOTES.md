# new-media-artist-simulator 整理说明

> **状态**: 整理中
> **目标**: 将少媒体艺术、混沌媒体艺术、泛在媒体艺术归并到新媒体艺术家模拟器，作为其子集
> **反向研究**: 场域理论、四个类别展开成详细文档

---

## 一、整理思路

### 1.1 核心目标

1. **归并媒体艺术仓库** - 将以下仓库归并到new-media-artist-simulator，作为其子集：
   - chaos-media-art（混沌媒体艺术）
   - less-media-art（少媒体艺术）
   - ubiquitous-media-art（泛在媒体艺术）

2. **反向研究场域理论** - 将游戏中的理论展开成详细文档：
   - 布尔迪厄「艺术场域」理论
   - 福柯「话语权力」理论
   - 后数字时代的媒介艺术理论

3. **展开游戏设定** - 将游戏中的设定展开成独立文档：
   - 空间设定（spaces.json）
   - 项目设定（projects.json）
   - 事件设定（events.json）
   - 准备设定（preparations.json）

---

## 二、目录结构（整理后）

```
new-media-artist-simulator/
├── README.md
├── ORGANIZATION_NOTES.md（本文档）
│
├── STUDIES/（研究文档）
│   ├── THEORETICAL_FRAMEWORK.md（理论框架）
│   ├── ARTIST_STATEMENT.md（艺术家声明）
│   ├── DESIGN_CRITIQUE.md（设计批判）
│   ├── FINAL_REPORT.md（最终报告）
│   ├── GITHUB_PAGES_TUTORIAL.md（GitHub Pages教程）
│   ├── PRAISE.md（赞美）
│   ├── PROJECT_FRAMEWORK.md（项目框架）
│   ├── PROJECT_MANAGEMENT.md（项目管理）
│   ├── PROJECT_REVIEW.md（项目评审）
│   ├── REVIEW_COMMITTEE.md（评审委员会）
│   ├── TECHNICAL_CRITIQUE.md（技术批判）
│   ├── TECHNICAL_IMPLEMENTATION.md（技术实现）
│   ├── TOPIC_EXPANSION.md（主题展开）
│   ├── USER_EXPERIENCE_IMPROVEMENT.md（用户体验改进）
│   ├── USER_TESTING_BASIC.md（用户测试基础）
│   ├── USER_TESTING_DEEP.md（用户测试深度）
│   ├── USER_TESTING_EXTREME.md（用户测试极端）
│   └── VALUE_CRITIQUE.md（价值批判）
│
├── SETTINGS/（游戏设定，从JSON展开）
│   ├── SPACES.md（空间设定）
│   ├── PROJECTS.md（项目设定）
│   ├── EVENTS.md（事件设定）
│   ├── PREPARATIONS.md（准备设定）
│   ├── INCOME.md（收入设定）
│   └── SCHOOLS.md（学派设定）
│
├── SUBSETS/（子集媒体艺术仓库）
│   ├── chaos-media-art/（混沌媒体艺术）
│   ├── less-media-art/（少媒体艺术）
│   └── ubiquitous-media-art/（泛在媒体艺术）
│
├── GAME/（游戏程序）
│   ├── new-media-artist-simulator/（游戏主程序）
│   ├── archive/（历史版本）
│   └── ...
│
├── EXHIBITION_ARCHIVING/（展览归档）
│   └──（预留，展览归档练习课题）
│
└── index.html（GitHub Pages入口）
```

---

## 三、待办事项

### 3.1 第一阶段：整理现有内容

- [x] 创建STUDIES/目录
- [x] 将docs/移到STUDIES/
- [ ] 将JSON设定展开成Markdown文档
- [ ] 整理目录结构

### 3.2 第二阶段：归并媒体艺术仓库

- [ ] 克隆chaos-media-art、less-media-art、ubiquitous-media-art
- [ ] 在SUBSETS/目录中组织
- [ ] 归并到new-media-artist-simulator体系

### 3.3 第三阶段：反向研究

- [ ] 展开场域理论成详细文档
- [ ] 展开四个类别成详细文档
- [ ] 整理研究成果

---

## 四、媒体艺术仓库归并方案

### 4.1 仓库清单

| 仓库 | 状态 | 归并位置 |
|-------|------|----------|
| chaos-media-art | 待克隆 | SUBSETS/chaos-media-art/ |
| less-media-art | 待克隆 | SUBSETS/less-media-art/ |
| ubiquitous-media-art | 待克隆 | SUBSETS/ubiquitous-media-art/ |

### 4.2 归并逻辑

- **新媒体艺术家模拟器** - 主仓库，体系核心
- **混沌媒体艺术** - 子集，作为新媒体艺术家模拟器的一个研究方向
- **少媒体艺术** - 子集，作为新媒体艺术家模拟器的一个研究方向
- **泛在媒体艺术** - 子集，作为新媒体艺术家模拟器的一个研究方向

---

## 五、游戏程序和设定分离

### 5.1 分离原则

- **GAME/** - 游戏程序（server.js, index.html, JS/CSS等）
- **SETTINGS/** - 游戏设定（从JSON展开的Markdown文档）
- **STUDIES/** - 研究文档（理论、批判等）

---

## 六、下一步行动

1. 继续整理现有内容
2. 克隆三个媒体艺术仓库
3. 展开JSON设定成Markdown
4. 提交整理后的仓库

---

*整理进行中，持续更新...*
