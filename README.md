# CrossChat — 跨链 AI 助手

> 基于 ZetaChain + 阿里千问（Qwen）的黑客松 MVP  
> 用户通过自然语言发起跨链操作，AI 解析意图，ZetaChain 执行交易。

## 技术栈
- 前端：React + Vite + wagmi + Web3Modal
- 后端：Node.js + Express + Qwen API
- 跨链：ZetaChain（测试网）

## 开发

### 准备
1. 在 `server/.env` 中配置：
   ```env
   DASHSCOPE_API_KEY=your_key_here