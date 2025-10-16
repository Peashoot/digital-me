-- ================================================
-- Migration: Add User Language Preference
-- 为用户表添加语言偏好字段
-- ================================================

-- ================================================
-- 1. Add language_preference column to profiles table
-- ================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'zh-CN';

-- Add column comment
COMMENT ON COLUMN public.profiles.language_preference IS '用户语言偏好 (zh-CN, en-US)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_language_preference
ON public.profiles(language_preference);

-- ================================================
-- 2. Update existing users with default language
-- ================================================

-- Set default language to zh-CN for existing users
UPDATE public.profiles
SET language_preference = 'zh-CN'
WHERE language_preference IS NULL;

-- ================================================
-- Migration Complete
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'User Language Preference Migration Completed!';
    RAISE NOTICE 'Changes:';
    RAISE NOTICE '  1. Added language_preference column to profiles table';
    RAISE NOTICE '  2. Set default language to zh-CN';
    RAISE NOTICE '  3. Created index for better query performance';
    RAISE NOTICE '==================================================';
END
$$;
