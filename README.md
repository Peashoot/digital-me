# Digital Me v2.0

基于 Vue 3 + Supabase 的多模型 AI 对话系统

一个现代化、功能丰富的 AI 聊天应用，支持多个主流 AI 模型提供商，提供流畅的对话体验和强大的功能配置。

## ✨ 核心特性

- 🤖 **多模型支持** - 集成 10+ 主流 AI 模型提供商
- 🎯 **智能分组** - 按提供商自动分组，支持快速搜索
- 💡 **深度思考** - Claude 模型专属深度推理模式
- 🌐 **联网查询** - 实时获取最新信息
- 📎 **文件上传** - 支持 PDF、图片等多种格式
- 🔄 **实时同步** - 消息自动同步，多设备无缝切换
- 🎨 **现代 UI** - 响应式设计，支持明暗主题
- ⚡ **流式输出** - SSE 实时流式响应

## 技术栈

### 前端
- **Vue 3** - Composition API
- **Vite 5** - 极速构建工具
- **Pinia** - 轻量级状态管理
- **Vue Router 4** - 单页面路由
- **Naive UI** - 高质量 Vue 3 组件库
- **Tailwind CSS** - 原子化 CSS 框架
- **@supabase/supabase-js** - Supabase 客户端

### 后端
- **Supabase** - 开源 Firebase 替代方案
  - PostgreSQL 数据库 + RLS 行级安全
  - GitHub OAuth 认证
  - Realtime 实时订阅
  - Edge Functions (Deno runtime)
  - Storage 文件存储

### AI 模型提供商

#### 🇺🇸 国际模型
- **Anthropic** - Claude 3.5 Sonnet, Claude 3.7 Sonnet, Claude 4.5 Sonnet
- **OpenAI** - GPT-4, GPT-3.5 系列
- **Google** - Gemini 2.5 Pro/Flash, Gemma 3
- **xAI** - Grok 3/4, Grok Code Fast
- **DeepSeek** - DeepSeek V3.2, R1

#### 🇨🇳 国产模型
- **智谱 AI (GLM)** - GLM-4.6, GLM-4.5, GLM-4 系列
- **Moonshot (Kimi)** - Kimi 8K/32K/128K
- **阿里云 (通义千问)** - Qwen Plus/Max/Turbo, Qwen VL Max
- **字节跳动 (豆包)** - Doubao Seed 1.6 系列
- **腾讯 (混元)** - Hunyuan T1, TurboS, A13B

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

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Supabase CLI
- Git

### 1. 克隆项目
```bash
git clone https://github.com/yourusername/digital-me-v2.git
cd digital-me-v2
```

### 2. 安装前端依赖
```bash
cd frontend
npm install
```

### 3. 配置环境变量

创建 `frontend/.env.local` 文件：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173`

### 5. 配置 Supabase

#### 5.1 登录并链接项目
```bash
# 登录 Supabase
supabase login

# 链接到你的项目
cd supabase
supabase link --project-ref YOUR_PROJECT_REF
```

#### 5.2 执行数据库迁移
```bash
# 推送所有迁移到数据库
supabase db push
```

迁移文件包括：
- `001_initial_schema.sql` - 基础表结构
- `002_add_advanced_features.sql` - AI 模型表、文件表
- `003_add_sort_order.sql` - 排序字段
- `004_add_new_ai_models.sql` - 新增多个 AI 模型
- `005_add_providers_table.sql` - 提供商表

#### 5.3 配置 API Keys

在 Supabase Dashboard 的 **Project Settings > Edge Functions > Secrets** 中添加：

```bash
# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-xxx

# 智谱 AI (GLM)
GLM_API_KEY=xxx

# Moonshot (Kimi)
MOONSHOT_API_KEY=sk-xxx

# DeepSeek
DEEPSEEK_API_KEY=sk-xxx

# xAI (Grok)
GROK_API_KEY=xai-xxx

# Google (Gemini)
GEMINI_API_KEY=AIzaSyxxx

# 阿里云 (通义千问)
QWEN_API_KEY=sk-xxx

# 字节跳动 (豆包)
DOUBAO_API_KEY=xxx

# 腾讯 (混元)
HUNYUAN_API_KEY=xxx

# OpenAI (可选)
OPENAI_API_KEY=sk-xxx
```

> 📘 详细的 API Key 获取指南请参考 [MODEL_CONFIG.md](./MODEL_CONFIG.md)

#### 5.4 部署 Edge Functions
```bash
supabase functions deploy chat
```

#### 5.5 配置 GitHub OAuth

1. 前往 GitHub Settings > Developer settings > OAuth Apps
2. 创建新的 OAuth App
3. 设置回调 URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. 在 Supabase Dashboard > Authentication > Providers 中启用 GitHub
5. 填入 Client ID 和 Client Secret

## 📋 功能列表

### ✅ 核心功能
- 🔐 **用户认证**
  - GitHub OAuth 登录
  - 安全的 Session 管理
  - 行级安全（RLS）数据隔离

- 💬 **对话管理**
  - 创建/删除/重命名会话
  - 实时消息同步
  - SSE 流式响应
  - 对话历史记录
  - 中断生成功能

- 🤖 **AI 模型**
  - 10+ 模型提供商
  - 按提供商智能分组
  - 模型快速搜索
  - 实时切换模型
  - 模型能力标签（视觉/思考/工具）

- ⚙️ **功能配置**
  - 深度思考模式（Claude 专属）
  - 联网查询开关
  - 温度/Token 参数调节

- 📎 **文件支持**
  - PDF 文档上传
  - 图片识别（支持视觉模型）
  - TXT/DOC 文档
  - 文件大小限制 50MB

- 🎨 **用户体验**
  - 明暗主题切换
  - 响应式设计（移动端优先）
  - 平滑动画过渡
  - 现代化 UI 组件

- 💾 **数据管理**
  - 对话导出（TXT/JSON）
  - 云端自动保存
  - 多设备同步

### 🚧 规划中
- 👥 多平台账号绑定
- 🔔 消息推送通知
- 📊 使用统计面板
- 🎤 语音输入
- 📷 图片生成
- 🔍 对话搜索

## 📱 移动端适配

- ✅ 响应式断点: 640px / 768px / 1024px / 1280px
- ✅ 移动端优先的 Tailwind CSS 设计
- ✅ 触摸手势优化
- ✅ 配置面板折叠/展开
- ✅ 安全区域适配（safe-bottom）
- 🚧 PWA 支持 (可安装到主屏幕)

## 🏗️ 架构设计

### 前端架构
```
src/
├── components/        # 可复用组件
│   ├── ModelSelector.vue          # 模型选择器（分组+搜索）
│   ├── ChatInputEnhanced.vue      # 增强输入框
│   ├── MessageItem.vue            # 消息项
│   └── ConversationList.vue       # 会话列表
├── stores/           # Pinia 状态管理
│   ├── chat.js      # 对话状态
│   ├── user.js      # 用户状态
│   └── theme.js     # 主题状态
├── views/           # 页面组件
│   ├── ChatView.vue
│   ├── LoginView.vue
│   └── SettingsView.vue
└── lib/             # 第三方库配置
    └── supabase.js  # Supabase 客户端
```

### 后端架构
```
supabase/
├── functions/
│   └── chat/
│       ├── index.ts              # 主入口
│       ├── base.ts               # 基类适配器
│       ├── factory.ts            # 模型工厂
│       ├── claude.ts             # Claude 适配器
│       ├── glm.ts                # GLM 适配器
│       ├── moonshot.ts           # Moonshot 适配器
│       ├── deepseek.ts           # DeepSeek 适配器
│       ├── grok.ts               # Grok 适配器
│       ├── gemini.ts             # Gemini 适配器
│       ├── qwen.ts               # Qwen 适配器
│       ├── doubao.ts             # Doubao 适配器
│       └── hunyuan.ts            # Hunyuan 适配器
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_add_advanced_features.sql
    ├── 003_add_sort_order.sql
    ├── 004_add_new_ai_models.sql
    └── 005_add_providers_table.sql
```

## 🔒 安全特性

- ✅ 行级安全（RLS）- 用户数据隔离
- ✅ JWT Token 认证
- ✅ API Key 服务端存储
- ✅ CORS 跨域保护
- ✅ SQL 注入防护
- ✅ XSS 防护

## 🧪 开发指南

### 添加新的 AI 模型

1. 创建适配器文件 `supabase/functions/chat/new-model.ts`
2. 继承 `BaseModelAdapter` 类
3. 在 `factory.ts` 中注册
4. 添加数据库迁移
5. 配置 API Key

详细教程：[CONTRIBUTING.md](./CONTRIBUTING.md)

### 本地开发

```bash
# 启动前端开发服务器
cd frontend
npm run dev

# 启动本地 Supabase（可选）
cd supabase
supabase start

# 本地测试 Edge Function
supabase functions serve chat --env-file ./supabase/.env.local
```

## 📚 相关文档

- [API 配置指南](./MODEL_CONFIG.md)
- [部署文档](./docs/DEPLOYMENT.md)
- [开发指南](./docs/DEVELOPMENT.md)
- [常见问题](./docs/FAQ.md)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Supabase](https://supabase.com/)
- [Naive UI](https://www.naiveui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

⭐ 如果这个项目对你有帮助，请给一个 Star！
