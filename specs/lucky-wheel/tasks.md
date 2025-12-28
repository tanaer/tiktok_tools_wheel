# 实施计划 - 直播互动炫酷转盘

- [ ] 1. **项目初始化**
    - 使用 Vite 创建 React + TypeScript 项目。
    - 安装 TailwindCSS, framer-motion, canvas-confetti, lucide-react (图标), use-sound (音效)。
    - 配置基础目录结构和 assets 目录。
    - _需求: N/A_

- [ ] 2. **基础架构与状态管理**
    - 创建 `ConfigContext`，实现配置的读取、更新和 localStorage 持久化。
    - 定义默认配置（包含初始奖项和默认主题）。
    - _需求: 4_

- [ ] 3. **核心转盘绘制 (Canvas)**
    - 开发 `Wheel` 组件，接收 `items` 和 `theme` props。
    - 实现 `drawWheel` 函数：根据几率计算角度，绘制扇区、文字和分割线。
    - 实现 Canvas 自适应大小 (Responsive)。
    - _需求: 1, 2_

- [ ] 4. **转动逻辑与动画**
    - 实现 `useWheelLogic` hook，管理转速、旋转角度、状态（idle, spinning, stopping, won）。
    - 实现物理加减速算法。
    - 实现“点击开启 -> 转动 -> 停止 -> 结果展示”的完整流程。
    - _需求: 1, 2_

- [ ] 5. **音效系统集成**
    - 寻找并添加资源文件：`tick.mp3` (转动声), `win.mp3` (中奖声)。
    - 在转动逻辑中集成音效触发（扇区边界检测）。
    - 实现全局静音开关。
    - _需求: 3_

- [ ] 6. **配置面板开发**
    - 开发 `SettingsModal` 组件。
    - 实现奖项列表的增删改查 UI。
    - 实现“几率”输入框和“文本”输入框。
    - 实现主题选择器 UI。
    - _需求: 4_

- [ ] 7. **主题样式与特效完善**
    - 定义四套主题的配色方案 (Cyberpunk, Spring, Christmas, Flat)。
    - 实现中奖后的视觉特效（文字放大、Canvas Confetti 撒花）。
    - 适配 OBS 直播场景（确保无多余滚动条，全屏居中）。
    - _需求: 2, 4_

- [ ] 8. **验收与优化**
    - 全面测试所有功能。
    - 优化代码结构。
    - 编写 README。
