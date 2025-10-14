-- ================================================
-- Migration: Add Advanced Features Support
-- 添加深度思考、联网查询、文件上传、多模型支持
-- ================================================

-- ================================================
-- 1. 扩展 messages 表
-- ================================================

-- 添加附件字段（存储文件信息）
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 添加思考过程字段
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS thinking TEXT;

-- 添加工具调用记录字段
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS tool_calls JSONB DEFAULT '[]'::jsonb;

-- 添加评分字段（用于用户反馈）
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- 为 attachments 添加注释
COMMENT ON COLUMN public.messages.attachments IS '文件附件信息数组，格式: [{"file_id": "uuid", "file_name": "example.pdf", "file_type": "application/pdf", "file_size": 12345, "file_url": "url"}]';

-- 为 thinking 添加注释
COMMENT ON COLUMN public.messages.thinking IS 'AI 深度思考过程内容，仅在启用思考模式时使用';

-- 为 tool_calls 添加注释
COMMENT ON COLUMN public.messages.tool_calls IS '工具调用记录数组，格式: [{"tool": "web_search", "query": "...", "result": "..."}]';

-- ================================================
-- 2. 创建文件存储表
-- ================================================

CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL, -- Supabase Storage 路径
    extracted_text TEXT, -- 提取的文本内容（PDF、Word 等）
    metadata JSONB, -- 额外的元数据（如图片的 Vision API 分析结果）
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_conversation_id ON public.files(conversation_id);
CREATE INDEX IF NOT EXISTS idx_files_message_id ON public.files(message_id);

-- 启用 RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Files 表的 RLS 策略
CREATE POLICY "Users can view their own files"
    ON public.files FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own files"
    ON public.files FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own files"
    ON public.files FOR DELETE
    USING (user_id = auth.uid());

-- ================================================
-- 3. 扩展 conversations 表的 metadata 字段
-- ================================================

-- 更新 conversations 表注释，说明 metadata 字段的用途
COMMENT ON COLUMN public.conversations.metadata IS
'对话配置信息，JSON 格式:
{
  "model": "claude-3-5-sonnet-20241022",  // AI 模型
  "think_mode": true,                     // 是否启用深度思考
  "web_search": true,                     // 是否启用联网查询
  "temperature": 0.7,                     // 温度参数
  "max_tokens": 4096,                     // 最大 tokens
  "system_prompt": "custom prompt"        // 自定义系统提示词
}';

-- ================================================
-- 4. 创建 AI 模型配置表（可选，用于管理支持的模型）
-- ================================================

CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- 模型标识符
    display_name VARCHAR(255) NOT NULL, -- 显示名称
    provider VARCHAR(50) NOT NULL, -- 供应商: openai, anthropic, zhipu, moonshot
    api_endpoint TEXT NOT NULL, -- API 端点
    supports_streaming BOOLEAN DEFAULT true,
    supports_thinking BOOLEAN DEFAULT false, -- 是否支持思考模式
    supports_vision BOOLEAN DEFAULT false, -- 是否支持图片
    supports_tools BOOLEAN DEFAULT false, -- 是否支持工具调用
    max_tokens INTEGER DEFAULT 4096,
    default_temperature DECIMAL(3,2) DEFAULT 0.7,
    pricing_input DECIMAL(10,6), -- 输入价格（每 1K tokens）
    pricing_output DECIMAL(10,6), -- 输出价格（每 1K tokens）
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入支持的模型
INSERT INTO public.ai_models (name, display_name, provider, api_endpoint, supports_thinking, supports_vision, supports_tools, max_tokens) VALUES
('glm-4.5-flash', 'GLM-4.5-Flash', 'zhipu', 'https://open.bigmodel.cn/api/paas/v4/chat/completions', false, false, false, 4096),
('glm-4.5', 'GLM-4.5', 'zhipu', 'https://open.bigmodel.cn/api/paas/v4/chat/completions', false, true, true, 131072),
('glm-4.6', 'GLM-4.6', 'zhipu', 'https://open.bigmodel.cn/api/paas/v4/chat/completions', false, false, false, 8192),
('kimi-k2-0905-preview', 'Kimi K2', 'moonshot', 'https://api.moonshot.cn/v1/chat/completions', false, false, false, 8192),
('moonshot-v1-32k', 'Kimi (32K)', 'moonshot', 'https://api.moonshot.cn/v1/chat/completions', false, false, false, 32768),
('moonshot-v1-128k', 'Kimi (128K)', 'moonshot', 'https://api.moonshot.cn/v1/chat/completions', false, false, false, 131072),
('claude-sonnet-4-5-20250929', 'Claude 4.5 Sonnet', 'anthropic', 'https://api.anthropic.com/v1/messages', true, true, true, 200000),
('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'anthropic', 'https://api.anthropic.com/v1/messages', true, true, true, 200000)
ON CONFLICT (name) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON public.ai_models(provider);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_active ON public.ai_models(is_active);

-- 应用 updated_at 触发器
CREATE TRIGGER update_ai_models_updated_at
    BEFORE UPDATE ON public.ai_models
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- AI 模型表公开只读
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI models are publicly readable"
    ON public.ai_models FOR SELECT
    USING (is_active = true);

-- ================================================
-- 5. 创建使用统计表（可选，用于追踪 token 使用情况）
-- ================================================

CREATE TABLE IF NOT EXISTS public.usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    model VARCHAR(100) NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    cost DECIMAL(10,6) DEFAULT 0, -- 成本（美元）
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON public.usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_created_at ON public.usage_stats(created_at);

-- 启用 RLS
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage stats"
    ON public.usage_stats FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage stats"
    ON public.usage_stats FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ================================================
-- 6. 创建 Storage Bucket（用于文件上传）
-- ================================================

-- 注意：这部分需要在 Supabase Dashboard 中手动创建或使用 SQL
-- 这里提供参考脚本

-- 创建 bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage 策略：用户可以上传自己的文件
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage 策略：用户可以查看自己的文件
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage 策略：用户可以删除自己的文件
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================================
-- Migration Complete
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Advanced Features Migration Completed!';
    RAISE NOTICE 'Added support for:';
    RAISE NOTICE '  - File attachments (messages.attachments, files table)';
    RAISE NOTICE '  - Deep thinking mode (messages.thinking)';
    RAISE NOTICE '  - Web search tools (messages.tool_calls)';
    RAISE NOTICE '  - Multiple AI models (ai_models table)';
    RAISE NOTICE '  - Usage tracking (usage_stats table)';
    RAISE NOTICE '  - File storage (chat-files bucket)';
    RAISE NOTICE '==================================================';
END
$$;
