-- ================================================
-- Migration: Add sort_order to ai_models table
-- 为 AI 模型添加排序字段
-- ================================================

-- 添加 sort_order 字段
ALTER TABLE public.ai_models
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 999;

-- 为现有模型设置排序值
UPDATE public.ai_models SET sort_order = 1 WHERE name = 'glm-4.6';
UPDATE public.ai_models SET sort_order = 2 WHERE name = 'glm-4.5';
UPDATE public.ai_models SET sort_order = 3 WHERE name = 'glm-4.5-flash';
UPDATE public.ai_models SET sort_order = 4 WHERE name = 'kimi-k2-0905-preview';
UPDATE public.ai_models SET sort_order = 5 WHERE name = 'moonshot-v1-128k';
UPDATE public.ai_models SET sort_order = 6 WHERE name = 'moonshot-v1-32k';
UPDATE public.ai_models SET sort_order = 7 WHERE name = 'claude-sonnet-4-5-20250929';
UPDATE public.ai_models SET sort_order = 8 WHERE name = 'claude-3-5-sonnet-20241022';

-- 创建索引以提高排序查询性能
CREATE INDEX IF NOT EXISTS idx_ai_models_sort_order ON public.ai_models(sort_order);

-- 添加注释
COMMENT ON COLUMN public.ai_models.sort_order IS '模型显示顺序，数值越小越靠前';

-- ================================================
-- Migration Complete
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Model Sort Order Migration Completed!';
    RAISE NOTICE 'Added sort_order column to ai_models table';
    RAISE NOTICE 'Models will now be ordered by sort_order field';
    RAISE NOTICE '==================================================';
END
$$;
