# 从《新媒体艺术家模拟器》迁移到《新媒体时间模拟器》

## 命名建议

- 旧版：`new-media-artist-simulator`
- 新版：`new-media-time-simulator`

“艺术家”强调身份；
“时间”强调系统、阶段、资源流、养成与生产节奏。

如果你希望保留历史连续性，可以采用：

- 仓库主名不变，React 版放在 `react-prototype/`
- 或旧仓库归档，新版单独建仓

---

## 推荐迁移方式

### 方案 A：新建仓库

适合你想把旧版完整存档，不想污染原结构。

新仓库建议：

- `new-media-time-simulator`

旧仓库 README 顶部增加跳转：

> React 网页原型版本请见：new-media-time-simulator

### 方案 B：旧仓库开分支

适合你想保持 star、issue 和历史连续性。

建议分支：

- `archive/text-simulator-2026`
- `feat/react-prototype`
- `release/github-pages-prototype`

---

## 建议保留的旧目录

可以把旧版这些内容放入：

```text
archive/
  text-simulator-2026/
  theory/
  npc-source/
  world-settings/
```

然后把 React 原型作为新的前台入口：

```text
src/
docs/
public/
```

---

## GitHub Pages 建议

如果你未来想稳定对外展示，建议不要继续用“杂糅文档仓库直接跑页面”的方式。

更稳的方式：

- 让 React 原型单独构建
- Pages 只接收 `dist` 或 `docs/site-assets`
- 文档和页面分离

这样以后你即使增加：

- 图鉴
- 角色卡
- 对话数据库
- 节点可视化
- 存档浏览器

也不会把原来的资料库结构拖死。

---

## 最关键的结构变化

旧版核心：

- 文本设定
- 世界观阐述
- 研究文档

新版核心：

- `data/` 数据层
- `engine/` 规则层
- `components/` 展示层
- `docs/` 理论与设计文档

这意味着后续你可以把更多内容交给 agent：

- 只改数据，不动前端骨架
- 只增事件，不动主引擎
- 只加地图，不重写系统

