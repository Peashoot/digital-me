-- ================================================
-- Migration: Add i18n Support for Models and Providers
-- 为模型和提供商添加国际化支持
-- ================================================

-- ================================================
-- 1. Add display_names JSONB field to providers table
-- ================================================

-- 添加 display_names 字段
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS display_names JSONB DEFAULT '{}'::jsonb;

-- 添加字段注释
COMMENT ON COLUMN public.providers.display_names IS '多语言显示名称，格式: {"zh-CN": "智谱 AI (GLM)", "en-US": "Zhipu AI (GLM)"}';

-- 迁移现有数据
UPDATE public.providers
SET display_names = jsonb_build_object(
    'zh-CN', CASE name
        WHEN 'anthropic' THEN 'Anthropic (Claude)'
        WHEN 'zhipu' THEN '智谱 AI (GLM)'
        WHEN 'moonshot' THEN 'Moonshot (Kimi)'
        WHEN 'deepseek' THEN 'DeepSeek'
        WHEN 'xai' THEN 'xAI (Grok)'
        WHEN 'google' THEN 'Google (Gemini)'
        WHEN 'alibaba' THEN '阿里云 (通义千问)'
        WHEN 'bytedance' THEN '字节跳动 (豆包)'
        WHEN 'tencent' THEN '腾讯 (混元)'
        WHEN 'openai' THEN 'OpenAI'
        ELSE display_name
    END,
    'en-US', CASE name
        WHEN 'anthropic' THEN 'Anthropic (Claude)'
        WHEN 'zhipu' THEN 'Zhipu AI (GLM)'
        WHEN 'moonshot' THEN 'Moonshot (Kimi)'
        WHEN 'deepseek' THEN 'DeepSeek'
        WHEN 'xai' THEN 'xAI (Grok)'
        WHEN 'google' THEN 'Google (Gemini)'
        WHEN 'alibaba' THEN 'Alibaba Cloud (Qwen)'
        WHEN 'bytedance' THEN 'ByteDance (Doubao)'
        WHEN 'tencent' THEN 'Tencent (Hunyuan)'
        WHEN 'openai' THEN 'OpenAI'
        ELSE display_name
    END
)
WHERE display_names = '{}'::jsonb OR display_names IS NULL;

-- ================================================
-- 2. Add display_names JSONB field to ai_models table
-- ================================================

-- 添加 display_names 字段
ALTER TABLE public.ai_models
ADD COLUMN IF NOT EXISTS display_names JSONB DEFAULT '{}'::jsonb;

-- 添加字段注释
COMMENT ON COLUMN public.ai_models.display_names IS '多语言显示名称，格式: {"zh-CN": "GLM-4-Flash", "en-US": "GLM-4-Flash"}';

-- 为 ai_models 表添加 sort_order 字段（如果还没有）
ALTER TABLE public.ai_models
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 100;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_models_sort_order ON public.ai_models(sort_order);

-- 迁移现有数据 - GLM 模型
UPDATE public.ai_models
SET display_names = jsonb_build_object(
    'zh-CN', display_name,
    'en-US', display_name
)
WHERE name LIKE 'glm-%'
AND (display_names = '{}'::jsonb OR display_names IS NULL);

-- 迁移现有数据 - Kimi 模型
UPDATE public.ai_models
SET display_names = jsonb_build_object(
    'zh-CN', display_name,
    'en-US', display_name
)
WHERE name LIKE 'kimi-%' OR name LIKE 'moonshot-%'
AND (display_names = '{}'::jsonb OR display_names IS NULL);

-- 迁移现有数据 - Claude 模型
UPDATE public.ai_models
SET display_names = jsonb_build_object(
    'zh-CN', display_name,
    'en-US', display_name
)
WHERE name LIKE 'claude-%'
AND (display_names = '{}'::jsonb OR display_names IS NULL);

-- 迁移现有数据 - DeepSeek 模型
UPDATE public.ai_models
SET display_names = jsonb_build_object(
    'zh-CN', display_name,
    'en-US', display_name
)
WHERE name LIKE 'deepseek-%'
AND (display_names = '{}'::jsonb OR display_names IS NULL);

-- 迁移现有数据 - Grok 模型
UPDATE public.ai_models
SET display_names = jsonb_build_object(
    'zh-CN', display_name,
    'en-US', display_name
)
WHERE name LIKE 'grok-%'
AND (display_names = '{}'::jsonb OR display_names IS NULL);

-- 迁移现有数据 - Gemini 模型
UPDATE public.ai_models
SET display_names = jsonb_build_object(
    'zh-CN', display_name,
    'en-US', display_name
)
WHERE (name LIKE 'gemini-%' OR name LIKE 'gemma-%')
AND (display_names = '{}'::jsonb OR display_names IS NULL);

-- 迁移现有数据 - Qwen 模型
UPDATE public.ai_models
SET display_names = jsonb_build_object(
    'zh-CN', display_name,
    'en-US', display_name
)
WHERE name LIKE 'qwen-%'
AND (display_names = '{}'::jsonb OR display_names IS NULL);

-- 迁移现有数据 - Doubao 模型
UPDATE public.ai_models
SET display_names = jsonb_build_object(
    'zh-CN', display_name,
    'en-US', display_name
)
WHERE name LIKE 'doubao-%'
AND (display_names = '{}'::jsonb OR display_names IS NULL);

-- 迁移现有数据 - Hunyuan 模型
UPDATE public.ai_models
SET display_names = jsonb_build_object(
    'zh-CN', display_name,
    'en-US', display_name
)
WHERE name LIKE 'hunyuan-%'
AND (display_names = '{}'::jsonb OR display_names IS NULL);

-- 迁移其他模型（如果有）
UPDATE public.ai_models
SET display_names = jsonb_build_object(
    'zh-CN', display_name,
    'en-US', display_name
)
WHERE display_names = '{}'::jsonb OR display_names IS NULL;

-- ================================================
-- 3. Create helper functions
-- ================================================

-- 创建辅助函数：根据语言获取提供商显示名称
CREATE OR REPLACE FUNCTION public.get_provider_display_name(
    provider_row public.providers,
    locale TEXT DEFAULT 'zh-CN'
)
RETURNS TEXT AS $$
BEGIN
    -- 尝试从 display_names JSONB 中获取对应语言的名称
    IF provider_row.display_names ? locale THEN
        RETURN provider_row.display_names->>locale;
    -- 如果没有对应语言，尝试获取默认语言（zh-CN）
    ELSIF provider_row.display_names ? 'zh-CN' THEN
        RETURN provider_row.display_names->>'zh-CN';
    -- 如果都没有，返回 display_name
    ELSE
        RETURN provider_row.display_name;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 创建辅助函数：根据语言获取模型显示名称
CREATE OR REPLACE FUNCTION public.get_model_display_name(
    model_row public.ai_models,
    locale TEXT DEFAULT 'zh-CN'
)
RETURNS TEXT AS $$
BEGIN
    -- 尝试从 display_names JSONB 中获取对应语言的名称
    IF model_row.display_names ? locale THEN
        RETURN model_row.display_names->>locale;
    -- 如果没有对应语言，尝试获取默认语言（zh-CN）
    ELSIF model_row.display_names ? 'zh-CN' THEN
        RETURN model_row.display_names->>'zh-CN';
    -- 如果都没有，返回 display_name
    ELSE
        RETURN model_row.display_name;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================
-- Migration Complete
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'I18n Support Migration Completed!';
    RAISE NOTICE 'Changes:';
    RAISE NOTICE '  1. Added display_names JSONB to providers table';
    RAISE NOTICE '  2. Added display_names JSONB to ai_models table';
    RAISE NOTICE '  3. Added sort_order to ai_models table';
    RAISE NOTICE '  4. Migrated existing data to display_names';
    RAISE NOTICE '  5. Created helper functions:';
    RAISE NOTICE '     - get_provider_display_name()';
    RAISE NOTICE '     - get_model_display_name()';
    RAISE NOTICE '==================================================';
END
$$;
