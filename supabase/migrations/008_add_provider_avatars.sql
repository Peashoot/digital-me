-- ================================================
-- Migration: Add Provider Avatars Support
-- 为提供商添加头像支持，并在消息中记录使用的提供商
-- ================================================

-- ================================================
-- 1. Update providers table - add avatar_url field
-- ================================================

-- 添加 avatar_url 字段（如果不存在，使用 icon_url）
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 添加字段注释
COMMENT ON COLUMN public.providers.avatar_url IS '提供商头像URL，存储在 Supabase Storage 的 provider-avatars bucket 中';

-- 更新现有的 icon_url 为 avatar_url（如果 icon_url 有值）
UPDATE public.providers
SET avatar_url = icon_url
WHERE icon_url IS NOT NULL AND avatar_url IS NULL;

-- ================================================
-- 2. Create Storage bucket for provider avatars
-- ================================================

-- 注意：这个需要在 Supabase Dashboard 中手动创建，或者使用 Supabase CLI
-- Bucket 名称: provider-avatars
-- 公共访问: true
-- 文件大小限制: 1MB
-- 允许的MIME类型: image/png, image/jpeg, image/svg+xml

-- ================================================
-- 3. Add model_provider to messages table
-- ================================================

-- 为 messages 表添加 model_provider 字段，记录发送消息时使用的提供商
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS model_provider VARCHAR(50);

-- 添加字段注释
COMMENT ON COLUMN public.messages.model_provider IS 'AI 提供商标识符（如: anthropic, zhipu, moonshot），用于显示对应的头像';

-- 添加外键约束（可选，确保数据完整性）
-- ALTER TABLE public.messages
-- ADD CONSTRAINT fk_messages_provider
-- FOREIGN KEY (model_provider) REFERENCES public.providers(name)
-- ON DELETE SET NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_model_provider ON public.messages(model_provider);

-- ================================================
-- 4. Update existing messages with provider info
-- ================================================

-- 尝试从 conversation metadata 或默认值更新现有消息的 provider
-- 这里我们根据常见的模型名称推断提供商
UPDATE public.messages
SET model_provider = CASE
    WHEN content LIKE '%claude%' OR content LIKE '%Claude%' THEN 'anthropic'
    WHEN content LIKE '%GLM%' OR content LIKE '%glm%' THEN 'zhipu'
    WHEN content LIKE '%kimi%' OR content LIKE '%Kimi%' THEN 'moonshot'
    WHEN content LIKE '%deepseek%' OR content LIKE '%DeepSeek%' THEN 'deepseek'
    WHEN content LIKE '%grok%' OR content LIKE '%Grok%' THEN 'xai'
    WHEN content LIKE '%gemini%' OR content LIKE '%Gemini%' THEN 'google'
    WHEN content LIKE '%qwen%' OR content LIKE '%通义%' THEN 'alibaba'
    WHEN content LIKE '%doubao%' OR content LIKE '%豆包%' THEN 'bytedance'
    WHEN content LIKE '%hunyuan%' OR content LIKE '%混元%' THEN 'tencent'
    WHEN content LIKE '%gpt%' OR content LIKE '%GPT%' THEN 'openai'
    ELSE 'zhipu' -- 默认使用智谱
END
WHERE role = 'assistant' AND model_provider IS NULL;

-- ================================================
-- 5. Update providers table with default avatar URLs
-- ================================================

-- 更新提供商的头像 URL（占位符，稍后会上传实际图片）
UPDATE public.providers
SET avatar_url = CASE name
    WHEN 'anthropic' THEN '/storage/v1/object/public/provider-avatars/anthropic.svg'
    WHEN 'zhipu' THEN '/storage/v1/object/public/provider-avatars/zhipu.svg'
    WHEN 'moonshot' THEN '/storage/v1/object/public/provider-avatars/moonshot.svg'
    WHEN 'deepseek' THEN '/storage/v1/object/public/provider-avatars/deepseek.svg'
    WHEN 'xai' THEN '/storage/v1/object/public/provider-avatars/xai.svg'
    WHEN 'google' THEN '/storage/v1/object/public/provider-avatars/google.svg'
    WHEN 'alibaba' THEN '/storage/v1/object/public/provider-avatars/alibaba.svg'
    WHEN 'bytedance' THEN '/storage/v1/object/public/provider-avatars/bytedance.png'
    WHEN 'tencent' THEN '/storage/v1/object/public/provider-avatars/tencent.png'
    WHEN 'openai' THEN '/storage/v1/object/public/provider-avatars/openai.svg'
    ELSE NULL
END;

-- ================================================
-- Migration Complete
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Provider Avatars Migration Completed!';
    RAISE NOTICE 'Changes:';
    RAISE NOTICE '  1. Added avatar_url to providers table';
    RAISE NOTICE '  2. Added model_provider to messages table';
    RAISE NOTICE '  3. Updated existing messages with provider info';
    RAISE NOTICE '  4. Set default avatar URLs for all providers';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Create "provider-avatars" bucket in Supabase Storage';
    RAISE NOTICE '  2. Upload provider avatar images to the bucket';
    RAISE NOTICE '  3. Update frontend to display provider avatars';
    RAISE NOTICE '==================================================';
END
$$;
