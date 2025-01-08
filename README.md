# new-media-artist-simulator
new-media-artist-simulator
# New Media Artist Simulator
# 新媒体艺术家模拟器

一个充满讽刺意味的浏览器游戏，模拟新媒体艺术家的生涯历程。


new-media-artist-simulator/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js         // 游戏主逻辑
│   ├── gameState.js    // 游戏状态管理
│   ├── eventSystem.js  // 事件系统
│   └── contentLoader.js // 内容加载器
├── content/
│   ├── spaces/
│   │   └── spaces.json     // 基础场景示例
│   ├── preparations/
│   │   └── preparations.json  // 基础研究示例
│   ├── projects/
│   │   └── projects.json     // 基础项目示例
│   └── events/
│       └── events.json      // 基础随机事件
└── README.md





## 快速开始

1. 克隆仓库
2. 在浏览器中打开 index.html
3. 开始你的艺术家生涯

## 添加自定义内容

游戏支持自定义内容，将符合格式的 JSON 文件放入对应文件夹即可：
- spaces/ - 空间和活动
- preparations/ - 研究和准备活动
- projects/ - 项目内容
- events/ - 随机事件

详细格式说明请参考各文件夹中的示例文件。

## 开发计划
- [x] 基础游戏框架
- [x] 成就系统
- [x] 内容加载系统
- [ ] 存档功能
- [ ] 档案导出
- [ ] 更多内容

# 新媒体艺术家模拟器（内测版本）

## 项目介绍
这是一个模拟新媒体艺术家生涯的文字游戏。玩家可以通过探索空间、研究准备、项目创作等方式来体验新媒体艺术家的日常。目前处于内测阶段，欢迎提供反馈和建议。

## 游戏预览
[这里可以放游戏录屏或截图链接]

## 如何运行游戏

### 方法一：使用 Visual Studio Code（推荐）
1. 下载并安装 [Visual Studio Code](https://code.visualstudio.com/)
2. 在 VS Code 中安装 "Live Server" 扩展：
   - 点击左侧扩展图标（或按 Ctrl+Shift+X）
   - 搜索 "Live Server"
   - 安装 "Live Server" 扩展
3. 下载游戏文件并解压
4. 在 VS Code 中打开解压后的文件夹
5. 右键点击 index.html，选择 "Open with Live Server"
6. 游戏将在你的默认浏览器中自动打开

### 方法二：使用其他本地服务器
- Python：
  ```bash
  # Python 3
  python -m http.server 8080
  # Python 2
  python -m SimpleHTTPServer 8080
然后在浏览器中访问 http://localhost:8080

Node.js：
安装 http-server：npm install -g http-server
在项目目录运行：http-server
访问显示的地址（通常是 http://localhost:8080）
为什么需要服务器？
由于游戏需要加载本地JSON文件，直接打开HTML文件会因浏览器的安全限制而无法正常运行。使用本地服务器可以解决这个问题。

当前版本特性
基础属性系统：理论水平、社交资本、迷惑指数、资金
多样化的场景探索
研究和准备系统
项目创作机制
随机事件系统
成就系统
游戏进度保存与导出
已知问题
[列出当前已知的问题]
...
更新计划
[列出计划添加的功能]
...
参与内测
目前游戏在内测阶段，您可以通过以下方式参与：

加入小红书群：VIRTURA Spaceport
[可以添加其他联系方式]
反馈与建议
如果您在游玩过程中遇到任何问题或有任何建议，欢迎通过以下方式联系我们：

小红书群：VIRTURA Spaceport
[其他联系方式]
关于发布
我们计划在完善功能并收集足够反馈后，将游戏发布到网站上。网站开发正在学习中，敬请期待。

版权说明
© 2024 [VIRTURA Spaceport]. 保留所有权利。
本游戏为内测版本，未经许可，请勿传播或用于商业用途。

致谢
感谢所有参与内测的玩家提供的宝贵意见。

注：本文档会随着游戏开发持续更新。
