# 先看这里

## 你现在拿到的是什么

这是一个可以继续开发的 React / Vite 原型包，核心目标是：

- 在本地快速跑起来
- 能发到 GitHub Pages
- 把旧版《新媒体艺术家模拟器》升级成网页游戏结构

## 最快启动

### macOS / Linux

```bash
npm install
npm run dev
```

### Windows PowerShell

```powershell
npm install
npm run dev
```

## 先别急着改哪里

优先看这几个文件：

1. `README.md`
2. `docs/OLD_VERSION_AUDIT.md`
3. `docs/ENGINE_THEORY.md`
4. `src/data/`
5. `src/engine/gameEngine.js`

## 你最可能先改的地方

- 想加角色和流派：改 `src/data/archetypes.js`
- 想加地图：改 `src/data/maps.js`
- 想加 NPC：改 `src/data/npcs.js`
- 想加技能：改 `src/data/skills.js`
- 想改玩法规则：改 `src/engine/gameEngine.js`

