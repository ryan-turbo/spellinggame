# PU2 英英背词工具 · Web 版

基于 Power Up 2 教材词汇，面向小学生的可视化背词工具。

**技术栈：** React + Vite

## 开发环境

```bash
cd web
npm install
npm run dev     # 开发服务器 http://localhost:5173
npm run build   # 生产构建
```

## 项目结构

```
pu-spelling-game/
├── web/
│   ├── src/
│   │   ├── App.jsx        # 主组件（三级导航）
│   │   ├── App.css        # 样式
│   │   ├── helpers.jsx    # 辅助函数（音节拆分等）
│   │   ├── data/          # 词汇数据
│   │   ├── components/    # React 组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   └── pages/         # 页面组件
│   ├── public/images/     # 闪卡图片
│   └── package.json
├── flashcard_images/       # 源图片目录
├── data/
│   └── pu2_vocab.py       # 词汇源数据
└── docs/
    └── WEB_VERSION_PRD.md # 产品需求文档
```

## 功能

- **浏览词库**：PU1/PU2/PU3 课程卡片 → 9 单元列表
- **闯关挑战**：随机 10 词拼写（音节分组输入 + IPA 音标）
- **闪卡学习**：翻转记忆（Freemium：前 3 单元免费）
- **键盘音效**：打字音 + Bingo 和弦

## 图片命名规则

闪卡图片放入 `web/public/images/`，文件名 = 单词全小写 + 空格变下划线，如 `world_tour.png`。
