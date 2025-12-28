# 技术方案 - 直播互动炫酷转盘

## 1. 架构概览

本项目将采用 **Web 前端单页应用 (SPA)** 架构。由于不需要服务器端存储（数据存储在本地），部署和使用都非常便捷。

### 1.1 技术栈选型

*   **核心框架**: `React 18` + `Vite`
    *   *理由*: 现代、快速、组件化开发，生态丰富。
*   **UI 样式**: `TailwindCSS`
    *   *理由*: 快速构建配置面板和响应式布局，方便主题切换。
*   **转盘绘制与动效**: `Canvas API` (自定义封装)
    *   *理由*: 需支持“扇区大小随几率变化”，现有库（如 `lucky-canvas`）大多默认等分扇区，自定义 Canvas 绘制能最大化满足不定宽扇区和高性能渲染的需求。
*   **动画引擎**: `framer-motion` (UI 交互) + `canvas-confetti` (中奖撒花)
    *   *理由*: `framer-motion` 处理面板开关、按钮动效非常流畅；`confetti` 是轻量级的粒子特效库。
*   **状态管理**: `React Context` + `Hooks`
    *   *理由*: 应用规模较小，无需 Redux，Context 足以管理配置和转盘状态。
*   **持久化**: `localStorage`
    *   *理由*: 自动保存用户的转盘配置（奖项、几率、主题），刷新不丢失。

## 2. 模块设计

### 2.1 核心组件结构

```mermaid
graph TD
    App --> Layout[布局容器 (全屏/主题背景)]
    Layout --> WheelContainer[转盘核心容器]
    WheelContainer --> CanvasLayer[Canvas 绘制层 (扇区/指针)]
    WheelContainer --> AnimationLayer[动画覆盖层 (中奖特效)]
    Layout --> Controls[控制层]
    Controls --> SpinButton[开启按钮]
    Controls --> SettingsButton[设置入口]
    Layout --> SettingsPanel[配置面板 (Modal)]
    SettingsPanel --> ItemEditor[奖项编辑器]
    SettingsPanel --> ThemeSelector[主题选择器]
    SettingsPanel --> SoundToggle[音效开关]
```

### 2.2 数据模型

**Config (配置对象)**
```typescript
interface Config {
  theme: 'cyberpunk' | 'spring' | 'christmas' | 'flat';
  soundEnabled: boolean; // 总音效开关
  items: WheelItem[];
}

interface WheelItem {
  id: string;
  text: string; // 奖项文字
  probability: number; // 几率权重 (决定扇区角度)
  color?: string; // 可选自定义颜色，否则使用主题色
}
```

### 2.3 关键逻辑实现

#### 2.3.1 动态扇区角度计算
由于需求要求“几率越大，空间越大”，我们需要根据所有项的 `probability` 总和计算每个项的 `angle`。
*   `totalProb = sum(items.probability)`
*   `item.angle = (item.probability / totalProb) * 360`

#### 2.3.2 物理转动模拟
不使用简单的 CSS `rotate`，而是使用 requestAnimationFrame 模拟物理速度，以便精确控制减速和回弹。
*   **阶段 1: 加速 (Acceleration)** - 速度从 0 增加到 `maxSpeed`。
*   **阶段 2: 惯性旋转 (Cruising)** - 保持 `maxSpeed` 旋转一定时间（确保悬念）。
*   **阶段 3: 减速 (Deceleration)** - 施加摩擦力，速度逐渐归零。
*   **阶段 4: 停止与回弹 (Stop & Recoil)** - 简单的弹性缓动效果，最终停在目标角度。

#### 2.3.3 碰撞检测与音效
在 `requestAnimationFrame` 循环中，检测当前角度是否经过了“指针”位置（通常是 270度或 0度）。每经过一个扇区边界，如果 `soundEnabled` 为真，触发一次短促的“Click”音效。

## 3. 主题系统设计

通过 Tailwind 的 `data-theme` 属性或 CSS Variables 实现主题切换。

| 主题 | 背景 | 转盘主色 | 字体色 | 特效元素 |
| :--- | :--- | :--- | :--- | :--- |
| **Cyberpunk** | 深蓝/黑渐变 | 霓虹粉/青/紫 | 亮白/发光 | 故障风文字、激光 |
| **Spring** | 正红/暗红纹理 | 金/红/橙 | 金色 | 灯笼、鞭炮、金币 |
| **Christmas** | 深绿/红/雪白 | 红/绿/金 | 白色 | 雪花飘落、铃铛 |
| **Flat** | 浅灰/白 | 莫兰迪色系 | 深灰 | 简约几何 |

## 4. 测试策略

*   **功能测试**: 验证添加/删除奖项后，转盘扇区是否正确重绘；验证几率设置为 0 或极大值时的表现。
*   **兼容性测试**: 验证在 OBS 浏览器源中的显示效果（透明背景支持等）。
*   **性能测试**: 确保长时间运行动画不卡顿。
