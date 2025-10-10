# Digital Me

基于 Vue 3 + Supabase 的 AI 数字分身对话系统

## 技术栈

### 前端
- Vue 3 (Composition API)
- Vite 5
- Pinia (状态管理)
- Vue Router 4
- Naive UI (UI 组件库)
- Tailwind CSS (移动端优先)
- @supabase/supabase-js (Supabase 客户端)

### 后端
- Supabase (BaaS)
  - Database (PostgreSQL + RLS)
  - Authentication (GitHub OAuth)
  - Realtime (WebSocket)
  - Edge Functions (AI Chat)

### AI 提供商
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- 阿里云 (Qwen)
- DeepSeek
- Moonshot (Kimi)
- 智谱 AI (GLM)

## 项目结构

```
digital-me/
├── frontend/                 # 前端应用
│   ├── public/              # 静态资源
│   ├── src/
│   │   ├── assets/          # 资源文件
│   │   ├── components/      # 组件
│   │   ├── composables/     # 组合式函数
│   │   ├── layouts/         # 布局组件
│   │   ├── lib/             # 第三方库配置
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── styles/          # 样式文件
│   │   ├── utils/           # 工具函数
│   │   └── views/           # 页面组件
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── supabase/                # Supabase 配置
│   ├── functions/           # Edge Functions
│   │   └── chat/           # AI 聊天函数
│   └── migrations/         # 数据库迁移
│
└── docs/                    # 文档
    ├── SETUP.md            # 安装指南
    ├── DEPLOYMENT.md       # 部署指南
    └── API.md              # API 文档
```

## 快速开始

### 1. 安装依赖
```bash
cd frontend
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 填入 Supabase 凭证
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 部署 Supabase
```bash
# 登录 Supabase
supabase login

# 链接项目
cd supabase
supabase link --project-ref YOUR_PROJECT_REF

# 执行数据库迁移
supabase db push

# 部署 Edge Functions
supabase functions deploy chat
```

## 功能特性

### ✅ 已实现
- 🔐 GitHub OAuth 登录
- 💬 AI 多模型对话
- 📱 移动端响应式设计
- 🔄 实时会话同步
- 💾 对话历史记录
- 📤 对话导出 (TXT/JSON)
- 🎨 主题切换 (明暗模式)
- ⚙️ 设置面板

### 🚧 开发中
- 👥 多平台账号绑定
- 🔔 消息通知
- 📊 使用统计

## 移动端适配

- 响应式断点: 640px / 768px / 1024px / 1280px
- 移动端优先的 Tailwind CSS 设计
- 触摸手势优化
- PWA 支持 (可安装到主屏幕)

## 许可证

MIT
