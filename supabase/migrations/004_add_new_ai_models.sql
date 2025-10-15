-- ================================================
-- Migration: Add new AI models
-- 添加新的 AI 模型
-- ================================================

-- 插入 DeepSeek 模型
INSERT INTO public.ai_models (name, display_name, provider, api_endpoint, is_active, sort_order, max_tokens, supports_vision, supports_tools)
VALUES
  ('deepseek-v3.2-exp', 'DeepSeek V3.2 Exp', 'deepseek', 'https://api.deepseek.com/v1/chat/completions', true, 20, 8192, false, true),
  ('deepseek-chat-v3.1', 'DeepSeek V3.1', 'deepseek', 'https://api.deepseek.com/v1/chat/completions', true, 21, 8192, false, true),
  ('deepseek-r1-0528', 'DeepSeek R1 0528', 'deepseek', 'https://api.deepseek.com/v1/chat/completions', true, 22, 8192, false, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  provider = EXCLUDED.provider,
  api_endpoint = EXCLUDED.api_endpoint,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  max_tokens = EXCLUDED.max_tokens,
  supports_vision = EXCLUDED.supports_vision,
  supports_tools = EXCLUDED.supports_tools;

-- 插入 Grok 模型
INSERT INTO public.ai_models (name, display_name, provider, api_endpoint, is_active, sort_order, max_tokens, supports_vision, supports_tools)
VALUES
  ('grok-4', 'Grok 4', 'xai', 'https://api.x.ai/v1/chat/completions', true, 30, 8192, false, true),
  ('grok-3', 'Grok 3', 'xai', 'https://api.x.ai/v1/chat/completions', true, 31, 8192, true, true),
  ('grok-code-fast-1', 'Grok Code Fast 1', 'xai', 'https://api.x.ai/v1/chat/completions', true, 32, 8192, true, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  provider = EXCLUDED.provider,
  api_endpoint = EXCLUDED.api_endpoint,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  max_tokens = EXCLUDED.max_tokens,
  supports_vision = EXCLUDED.supports_vision,
  supports_tools = EXCLUDED.supports_tools;

-- 插入 Gemini 模型
INSERT INTO public.ai_models (name, display_name, provider, api_endpoint, is_active, sort_order, max_tokens, supports_vision, supports_tools)
VALUES
  ('gemini-2.5-pro', 'Gemini 2.5 Pro', 'google', 'https://generativelanguage.googleapis.com/v1beta', true, 40, 8192, true, true),
  ('gemini-2.5-flash', 'Gemini 2.5 Flash', 'google', 'https://generativelanguage.googleapis.com/v1beta', true, 41, 32768, true, true),
  ('gemma-3-27b-it', 'Gemma 3 27B', 'google', 'https://generativelanguage.googleapis.com/v1beta', true, 42, 8192, true, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  provider = EXCLUDED.provider,
  api_endpoint = EXCLUDED.api_endpoint,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  max_tokens = EXCLUDED.max_tokens,
  supports_vision = EXCLUDED.supports_vision,
  supports_tools = EXCLUDED.supports_tools;

-- 插入 Qwen (通义千问) 模型
INSERT INTO public.ai_models (name, display_name, provider, api_endpoint, is_active, sort_order, max_tokens, supports_vision, supports_tools)
VALUES
  ('qwen-plus', 'Qwen Plus', 'alibaba', 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', true, 50, 131072, false, true),
  ('qwen-max', 'Qwen Max', 'alibaba', 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', true, 51, 32768, false, true),
  ('qwen-turbo', 'Qwen Turbo', 'alibaba', 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', true, 52, 8192, false, true),
  ('qwen-vl-max', 'Qwen VL Max', 'alibaba', 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', true, 53, 32768, true, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  provider = EXCLUDED.provider,
  api_endpoint = EXCLUDED.api_endpoint,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  max_tokens = EXCLUDED.max_tokens,
  supports_vision = EXCLUDED.supports_vision,
  supports_tools = EXCLUDED.supports_tools;

-- 插入 Doubao (豆包) 模型
-- 注意：豆包使用 endpoint_id，这里提供示例
INSERT INTO public.ai_models (name, display_name, provider, api_endpoint, is_active, sort_order, max_tokens, supports_vision, supports_tools)
VALUES
  ('doubao-seed-1-6', 'Doubao-Seed-1.6', 'bytedance', 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', true, 60, 4096, false, true),
  ('doubao-seed-1-6-thinking', 'Doubao-Seed-1.6-thinking', 'bytedance', 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', true, 61, 32768, false, true),
  ('doubao-seed-1-6-flash', 'Doubao-Seed-1.6-flash', 'bytedance', 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', true, 62, 4096, false, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  provider = EXCLUDED.provider,
  api_endpoint = EXCLUDED.api_endpoint,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  max_tokens = EXCLUDED.max_tokens,
  supports_vision = EXCLUDED.supports_vision,
  supports_tools = EXCLUDED.supports_tools;

-- 插入 Hunyuan (混元) 模型
INSERT INTO public.ai_models (name, display_name, provider, api_endpoint, is_active, sort_order, max_tokens, supports_vision, supports_tools)
VALUES
  ('hunyuan-t1-latest', 'Hunyuan-T1', 'tencent', 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions', true, 70, 8192, false, true),
  ('hunyuan-turbos-latest', 'Hunyuan-TurboS', 'tencent', 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions', true, 71, 8192, false, true),
  ('hunyuan-a13b', 'Hunyuan-A13B', 'tencent', 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions', true, 72, 8192, false, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  provider = EXCLUDED.provider,
  api_endpoint = EXCLUDED.api_endpoint,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  max_tokens = EXCLUDED.max_tokens,
  supports_vision = EXCLUDED.supports_vision,
  supports_tools = EXCLUDED.supports_tools;

-- ================================================
-- Migration Complete
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'New AI Models Migration Completed!';
    RAISE NOTICE 'Added models:';
    RAISE NOTICE '  - DeepSeek (3 models)';
    RAISE NOTICE '  - Grok (3 models)';
    RAISE NOTICE '  - Gemini (3 models)';
    RAISE NOTICE '  - Qwen (4 models)';
    RAISE NOTICE '  - Doubao (3 models)';
    RAISE NOTICE '  - Hunyuan (3 models)';
    RAISE NOTICE 'Total: 17 new models added';
    RAISE NOTICE '==================================================';
END
$$;
