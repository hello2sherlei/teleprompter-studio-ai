# Teleprompter Studio AI 提词器工作室

一个专业的 AI 驱动提词器应用，帮助你流畅地完成视频录制。

![Demo](./demo.png)

## ✨ 功能特点

- **AI 语速同步** - 自动检测说话速度，动态调整滚动速度
- **专业录制** - 支持摄像头和麦克风录制
- **脚本管理** - 创建、编辑、保存多个脚本
- **自定义设置** - 字体大小、滚动速度、文字颜色等
- **视频回顾** - 录制完成后预览和下载
- **移动端支持** - 响应式设计，手机也能用
- **深色模式** - 护眼深色主题

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🛠 技术栈

- React + TypeScript
- Tailwind CSS
- Vite
- Web Speech API
- MediaRecorder API

## 📱 支持平台

- 桌面端浏览器 (Chrome, Edge, Safari)
- 移动端浏览器 (需授权摄像头和麦克风)

## 📝 使用说明

1. **编辑脚本** - 在右侧面板输入或粘贴你的脚本
2. **调整设置** - 点击设置图标自定义显示效果
3. **开始滚动** - 点击播放按钮开始提词器滚动
4. **录制视频** - 点击红色按钮开始录制
5. **预览下载** - 录制完成后可预览和下载视频

## ⚙️ 环境变量

创建 `.env.local` 文件（可选）：

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

## 📄 License

MIT License
