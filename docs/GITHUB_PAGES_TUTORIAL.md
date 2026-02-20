# GitHub Pages 部署教程

## 快速部署指南（10分钟搞定）

### 前提条件
- 已有项目的GitHub仓库
- 已有GitHub账号
- 电脑安装了git

---

## 步骤1：准备项目文件

1. 确保项目里的所有前端文件（index.html、CSS、JS、图片等）整理好
2. 确保index.html在根目录
3. 双击index.html可以直接打开游戏
4. 确保所有文件的路径都是相对路径

---

## 步骤2：创建gh-pages分支

### 方法A：通过GitHub网页操作

1. 打开github仓库页面
2. 点击顶部的「Branch: main」下拉框
3. 输入 `gh-pages`
4. 点击「Create branch: gh-pages from 'main'」

### 方法B：通过命令行

```bash
# 进入项目目录
cd new-media-artist-simulator

# 创建并切换到gh-pages分支
git checkout -b gh-pages

# 推送到远程
git push origin gh-pages
```

---

## 步骤3：开启GitHub Pages功能

1. 在仓库页面，点击顶部的「Settings」
2. 左侧菜单找到「Pages」
3. 在「Build and deployment」里：
   - 「Source」选择「Deploy from a branch」
   - 「Branch」选择「gh-pages」
   - 文件夹选择「/ (root)」
4. 点击「Save」

---

## 步骤4：等待部署

- 等待1-2分钟
- 部署完成后，页面顶部会显示：
  ```
  Your site is live at https://你的用户名.github.io/new-media-artist-simulator/
  ```
- 这个链接就是你的在线体验链接

---

## 更新维护

后续更新项目文件：

```bash
# 切换到gh-pages分支
git checkout gh-pages

# 添加更新的文件
git add .

# 提交更改
git commit -m "更新内容"

# 推送到远程
git push origin gh-pages
```

GitHub会自动重新部署，1-2分钟后在线链接就会更新到最新版本。

---

## 注意事项

1. **文件路径**：确保所有资源使用相对路径
2. **文件大小**：单个文件不要超过100MB
3. **更新延迟**：每次更新后需要等待1-2分钟才能看到变化
4. **自定义域名**：如果需要自定义域名，在Pages设置里配置

---

## 常见问题

### Q: 页面显示404？
A: 检查index.html是否在根目录，检查分支是否正确选择gh-pages

### Q: 样式或图片加载失败？
A: 检查所有资源路径是否为相对路径

### Q: 更新后没有变化？
A: 清除浏览器缓存，或等待几分钟让部署完成

---

## 项目当前结构

```
new-media-artist-simulator/
├── index.html              # 入口页面（GitHub Pages首页）
├── .nojekyll              # 告诉GitHub不要用Jekyll处理
├── new-media-artist-simulator/  # 游戏主目录
│   ├── index.html         # 游戏入口
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   └── content/           # JSON内容文件
├── docs/                  # 文档
└── README.md              # 项目说明
```

---

*部署完成后，你的作品就可以通过链接直接访问了！*