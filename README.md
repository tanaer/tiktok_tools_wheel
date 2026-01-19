# 🎮 直播转盘 (Live Stream Lucky Wheel)

一个专为直播场景设计的透明转盘抽奖工具，支持 OBS 叠加、防窥控制和多种主题。
<img width="743" height="755" alt="image" src="https://github.com/user-attachments/assets/38e62f61-7cca-46a1-af82-06f427a91ced" />
<img width="794" height="814" alt="260119220821140" src="https://github.com/user-attachments/assets/5b964264-77a9-4f32-8457-ef23b5388344" />

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-v34-blue)
![React](https://img.shields.io/badge/React-v19-61dafb)

## ✨ 核心特性

*   **🎨 多种主题**：内置 赛博朋克、喜庆红金、圣诞主题、简约扁平、暖色渐变 等多种风格，适配不同直播氛围。
*   **👻 透明模式**：支持背景完全透明，可完美叠加在直播画面之上。
*   **🕵️‍♂️ 隐藏模式**：独特的“刮刮乐”式隐藏模式，只显示指针附近的奖项，增加悬念。
*   **🔒 防窥控制台**：
    *   **直播安全**：控制台默认隐藏在右下角，极不起眼。
    *   **结果操控**：支持“必中类型”、“必中具体奖项”、“不中上一个”以及“必中上一个”等高级操控功能。
    *   **随机伪装**：即使指定了结果，指针落点和旋转圈数依然保持随机，观众无法察觉。
*   **🖱️ 全局置顶与穿透**：窗口始终置顶，支持鼠标穿透（配置时除外）。
*   **📺 OBS 友好**：内置本地服务器，支持一键复制 OBS 浏览器源地址。

## 🚀 快速开始

### 安装

1.  下载最新版本的安装包（Release 页面）。
2.  运行安装程序。

### 开发运行

```bash
# 克隆仓库
git clone https://github.com/tanaer/tiktok_tools_wheel.git

# 进入目录
cd tiktok_tools_wheel

# 安装依赖
npm install

# 启动开发模式
npm run electron:dev
```

### 打包构建

```bash
# 构建 Windows 安装包
npm run electron:build
```

构建产物将位于 `release2` 目录下。

## 📖 使用指南

1.  **移动窗口**：按住窗口任意空白处即可拖动。
2.  **设置**：点击主界面下方的“齿轮”图标打开设置面板。
    *   **配置管理**：支持保存多套抽奖方案。
    *   **奖项编辑**：支持拖拽排序、修改概率、设置分类。
    *   **外观定制**：调整转盘大小、隐藏模式参数等。
3.  **开始抽奖**：点击主界面的“开始抽奖”按钮或按 `Space/Enter` 键。
4.  **高级控制**：
    *   将鼠标移动到屏幕**右下角**，会出现一个半透明的齿轮图标。
    *   点击展开控制面板，即可进行结果干预。

## 🛠️ 技术栈

*   **框架**: [Electron](https://www.electronjs.org/) + [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
*   **UI**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
*   **Canvas**: 原生 Canvas API 绘制高性能转盘。

## 📄 许可证

[MIT License](LICENSE)
