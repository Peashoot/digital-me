-- ================================================
-- Migration: Add providers table
-- 添加提供商表，用于存储提供商的显示名称和其他信息
-- ================================================

-- 创建 providers 表
CREATE TABLE IF NOT EXISTS public.providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 提供商标识符: anthropic, zhipu, moonshot, etc.
    display_name VARCHAR(100) NOT NULL, -- 显示名称: Anthropic (Claude), 智谱 AI (GLM), etc.
    description TEXT, -- 提供商描述
    website_url TEXT, -- 官网链接
    icon_url TEXT, -- 图标URL（可选）
    sort_order INTEGER DEFAULT 100, -- 排序顺序
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_providers_name ON public.providers(name);
CREATE INDEX IF NOT EXISTS idx_providers_sort_order ON public.providers(sort_order);
CREATE INDEX IF NOT EXISTS idx_providers_is_active ON public.providers(is_active);

-- 插入提供商数据
INSERT INTO public.providers (name, display_name, description, website_url, sort_order, is_active)
VALUES
    ('anthropic', 'Anthropic (Claude)', 'Claude 系列模型，专注于安全和可控的 AI 助手', 'https://www.anthropic.com', 1, true),
    ('zhipu', '智谱 AI (GLM)', 'ChatGLM 系列模型，清华大学开源大模型', 'https://www.zhipuai.cn', 2, true),
    ('moonshot', 'Moonshot (Kimi)', 'Kimi 系列模型，支持超长上下文', 'https://www.moonshot.cn', 3, true),
    ('deepseek', 'DeepSeek', 'DeepSeek 系列模型，专注于推理能力', 'https://www.deepseek.com', 4, true),
    ('xai', 'xAI (Grok)', 'Grok 系列模型，由 xAI 开发', 'https://x.ai', 5, true),
    ('google', 'Google (Gemini)', 'Gemini 系列模型，Google 最新多模态大模型', 'https://ai.google.dev', 6, true),
    ('alibaba', '阿里云 (通义千问)', '通义千问系列模型，阿里云大模型服务', 'https://dashscope.aliyun.com', 7, true),
    ('bytedance', '字节跳动 (豆包)', '豆包系列模型，字节跳动大模型服务', 'https://www.volcengine.com', 8, true),
    ('tencent', '腾讯 (混元)', '混元系列模型，腾讯云大模型服务', 'https://cloud.tencent.com', 9, true),
    ('openai', 'OpenAI', 'GPT 系列模型，OpenAI 开发', 'https://openai.com', 10, true)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    website_url = EXCLUDED.website_url,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 启用 RLS
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：所有人都可以读取提供商信息
CREATE POLICY "Anyone can view active providers"
    ON public.providers
    FOR SELECT
    USING (is_active = true);

-- 只有认证用户可以看到所有提供商（包括未激活的）
CREATE POLICY "Authenticated users can view all providers"
    ON public.providers
    FOR SELECT
    TO authenticated
    USING (true);

-- 创建触发器以自动更新 updated_at
CREATE OR REPLACE FUNCTION public.update_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER providers_updated_at
    BEFORE UPDATE ON public.providers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_providers_updated_at();

-- ================================================
-- Migration Complete
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Providers Table Migration Completed!';
    RAISE NOTICE 'Created providers table with 10 providers:';
    RAISE NOTICE '  - Anthropic (Claude)';
    RAISE NOTICE '  - 智谱 AI (GLM)';
    RAISE NOTICE '  - Moonshot (Kimi)';
    RAISE NOTICE '  - DeepSeek';
    RAISE NOTICE '  - xAI (Grok)';
    RAISE NOTICE '  - Google (Gemini)';
    RAISE NOTICE '  - 阿里云 (通义千问)';
    RAISE NOTICE '  - 字节跳动 (豆包)';
    RAISE NOTICE '  - 腾讯 (混元)';
    RAISE NOTICE '  - OpenAI';
    RAISE NOTICE '==================================================';
END
$$;
