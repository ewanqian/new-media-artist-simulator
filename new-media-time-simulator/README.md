# 新媒体时间模拟器 / New Media Time Simulator

## 艺术生态、生存策略与技能演化实验

基于旧版 **《新媒体艺术家模拟器》** 的一次结构性升级：
从以文本设定和艺术生态观察为主的交互式作品，升级为一个 **可在 GitHub Pages 运行的 React / Vite 网页游戏原型**。

这个版本的关键词不是“更复杂”，而是“更可扩展”：

- 有 **角色测评**，而不是直接进入文本
- 有 **干员外壳 / 流派**，而不是单一身份叙事
- 有 **地图 + 子地图**，让场域影响系统
- 有 **技能插槽**，让方法论模块化
- 有 **研发挂载队列**，让项目像种菜一样成长
- 有 **NPC 固定生态**，保留黑色幽默与现实讽刺
- 有 **本地缓存存档**，为后续 meta 结构留口子

---

## 当前版本定位

- **版本名**：v0.2.0 Prototype
- **技术栈**：React 18 + Vite 5
- **运行方式**：本地开发 / GitHub Pages
- **存档方式**：localStorage + JSON 导出导入
- **目标**：先搭一套能玩的底层系统，而不是一口气做完所有剧情

---

## 目录结构

```text
new-media-time-simulator/
├── docs/
│   ├── ENGINE_THEORY.md
│   ├── MIGRATION_FROM_OLD_SIMULATOR.md
│   ├── OLD_VERSION_AUDIT.md
│   ├── PLAYFLOW.md
│   └── site-assets/                 # 运行 deploy:docs 后生成
├── public/
├── scripts/
│   └── sync-docs.mjs
├── src/
│   ├── components/
│   │   ├── Assessment.jsx
│   │   ├── ArchetypePicker.jsx
│   │   └── Dashboard.jsx
│   ├── data/
│   │   ├── archetypes.js
│   │   ├── maps.js
│   │   ├── npcs.js
│   │   ├── projects.js
│   │   └── skills.js
│   ├── engine/
│   │   ├── gameEngine.js
│   │   └── utils.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── vite.config.js
```

---

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

### 4. 本地预览

```bash
npm run preview
```

---

## GitHub Pages 部署

本项目采用**源码 + 构建产物分离**的门户结构：
- 根目录 `index.html`：门户首页（四个入口）
- `new-media-time-simulator/`：React 原型**源码目录**（开发在这里进行）
- `site/new-media-time-simulator/`：React 原型**构建产物**（`npm run deploy:docs` 自动生成）
- `site/settings/`：设定阅读器（待开发）
- `site/knowledge/`：知识网络概括页（待开发）

### 部署流程：

```bash
# 进入 React 源码目录
cd new-media-time-simulator

# 安装依赖
npm install

# 构建并同步到 site 目录
npm run deploy:docs
```

这会把 React 构建产物自动同步到**根目录的 `site/new-media-time-simulator/` 文件夹**，门户首页 `index.html` 就能直接链接到它。

最后在 GitHub 仓库设置中，把 GitHub Pages 指向 **`/(root)`** 即可。

> 说明：为了减少路径问题，本项目的 `vite.config.js` 使用了 `base: './'`。这对于 GitHub Pages 的单页静态原型更稳，尤其适合你这种需要频繁分支试验、也可能在本地直接移动目录的状态。

---

## 为什么不用 CRA，而改成 Vite

你提到旧流程在沙盒或某些环境里容易报错。这个更新包直接绕开那类常见问题：

- 不走过重的旧脚手架逻辑
- 不依赖复杂 dev server 魔法配置
- 不需要额外后端
- 所有状态都在前端内存 + localStorage
- 可以先把“玩法骨架”搭稳定，再逐步接更多内容

这不是彻底解决所有外部 IDE / 沙盒问题，但它能显著减少：

- 路径错误
- 资源 base 错误
- 单页路由部署错误
- 本地开发和 GitHub Pages 行为不一致

---

## 玩法骨架

### 第一层：身份入口

- 3 个问题测评
- 推荐干员类型
- 允许无视推荐，自行选择流派

### 第二层：技能插槽

五种槽位：

- 方法论槽
- 工具槽
- 接口槽
- 生存槽
- 特勤槽

逻辑参考 Agent Skills：
不是把技能写成纯数值 buff，而是把“经验 / 方法 / 工作流”模块化。

### 第三层：地图系统

地图不是背景，而是影响数值、NPC、技能掉落和项目机会的场域。

当前原型包含：

- 榕树湾工作区
- 深港加速走廊
- 南岭学院与展厅群
- 离线渲染农场
- 北方双年展工地
- 海外驻留港

每个大地图下面都有子地图。

### 第四层：研发挂载

你可以挂项目，等回合推进后收成：

- 环幕失真仪式
- 驻留申请计划
- 技能模块化整理
- 品牌空间提案
- 方法论宣言重写

这个机制就是你说的那种：
像“挂渲染 / 种菜 / 养成”一样，让项目生长，而不是只是一段对话。

### 第五层：NPC 生态

继承旧版文本气质，但变成系统事件节点：

- 老炮张
- 王教授
- 甲方姐
- 孟工
- 开源幽灵
- 驻留管理员

他们不是一次性对白，而是会影响资源、叙事和节奏。

---

## 建议的 Git 分支策略

### 旧仓库存档

保留原仓库或原主干为：

- `archive/text-simulator-2026`

### 新开发分支

建议新开：

- `feat/react-prototype`
- `feat/gameplay-loop`
- `feat/npc-dialogue-expansion`
- `feat/map-ecosystem`

### 稳定演示分支

- `release/github-pages-prototype`

---

## 下一步最值得继续做的功能

1. 剧情事件编辑器：把 NPC 和地图事件拆成 JSON
2. 地图条件系统：装备 / 资源决定能否进入新区域
3. 装备芯片系统：从单纯技能扩展到真正的装备与 artifact
4. 多周目 meta：把玩家轨迹转成新 NPC
5. 图形化节点界面：把 skills 可视化为真正的节点编排图
6. 活动生产器：让“挂载研发”能生成展览 / workshop / 发布页等产物

---

## 说明

我不能直接替你在本机完成安装或修你本地 IDE 的沙盒环境，但这个包已经按“本地几步就能跑 + GitHub Pages 可发版”的思路整理好了。

如果你要把它接回原仓库，优先看：

- `docs/MIGRATION_FROM_OLD_SIMULATOR.md`
- `docs/OLD_VERSION_AUDIT.md`
- `docs/ENGINE_THEORY.md`

