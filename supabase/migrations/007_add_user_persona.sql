-- ================================================
-- Migration: Add User Persona (Digital Twin)
-- 添加用户数字分身设定表
-- ================================================

-- ================================================
-- 1. 创建用户数字分身设定表
-- ================================================

CREATE TABLE IF NOT EXISTS public.user_persona (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,

    -- ========== 基本信息 ==========
    full_name VARCHAR(100),                    -- 真实姓名
    preferred_name VARCHAR(50),                -- 称呼/昵称
    occupation VARCHAR(100),                   -- 职业
    company VARCHAR(100),                      -- 公司/组织
    location VARCHAR(100),                     -- 所在地
    age_range VARCHAR(20),                     -- 年龄段(20-30, 30-40等)
    education VARCHAR(200),                    -- 教育背景

    -- ========== 性格特点 ==========
    personality_type VARCHAR(50),              -- 性格类型(MBTI等)
    communication_style TEXT,                  -- 沟通风格描述
    tone VARCHAR(50) DEFAULT 'friendly',       -- 语气: friendly, professional, casual, humorous
    formality VARCHAR(50) DEFAULT 'moderate',  -- 正式程度: formal, moderate, casual
    humor_level INTEGER DEFAULT 5 CHECK (humor_level >= 1 AND humor_level <= 10),
    detail_level VARCHAR(50) DEFAULT 'moderate', -- 回答详细度: brief, moderate, detailed

    -- ========== 专业背景 ==========
    skills JSONB DEFAULT '[]'::jsonb,          -- 技能列表 ["Python", "项目管理", ...]
    expertise_areas JSONB DEFAULT '[]'::jsonb, -- 专业领域 ["Web开发", "人工智能", ...]
    work_experience TEXT,                      -- 工作经验描述
    achievements TEXT,                         -- 主要成就

    -- ========== 个人特色 ==========
    catchphrases JSONB DEFAULT '[]'::jsonb,    -- 口头禅/常用表达
    favorite_topics JSONB DEFAULT '[]'::jsonb, -- 喜欢讨论的话题
    values TEXT,                               -- 价值观
    hobbies JSONB DEFAULT '[]'::jsonb,         -- 兴趣爱好

    -- ========== 知识库 ==========
    personal_views JSONB DEFAULT '{}'::jsonb,  -- 个人观点 {"AI": "我认为...", "教育": "..."}
    faq_examples JSONB DEFAULT '[]'::jsonb,    -- 问答示例 [{"q": "...", "a": "..."}]
    background_info TEXT,                      -- 背景信息补充

    -- ========== 系统提示词 ==========
    system_prompt TEXT,                        -- 自动生成的系统提示词
    custom_instructions TEXT,                  -- 用户自定义指令

    -- ========== 元数据 ==========
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_persona_user_id ON public.user_persona(user_id);
CREATE INDEX IF NOT EXISTS idx_user_persona_is_active ON public.user_persona(is_active);

-- 添加字段注释
COMMENT ON TABLE public.user_persona IS '用户数字分身设定表，用于配置AI代表用户回答时的人设和风格';
COMMENT ON COLUMN public.user_persona.system_prompt IS '根据用户配置自动生成的系统提示词';
COMMENT ON COLUMN public.user_persona.skills IS '技能标签数组，如 ["Python", "项目管理"]';
COMMENT ON COLUMN public.user_persona.expertise_areas IS '专业领域数组，如 ["Web开发", "人工智能"]';
COMMENT ON COLUMN public.user_persona.personal_views IS 'JSON对象，记录对各话题的个人观点，如 {"AI": "我认为AI会改变世界"}';
COMMENT ON COLUMN public.user_persona.faq_examples IS 'FAQ示例数组，格式: [{"q": "你会什么？", "a": "我擅长..."}]';

-- ================================================
-- 2. RLS 策略
-- ================================================

ALTER TABLE public.user_persona ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的个人设定
CREATE POLICY "Users can view their own persona"
    ON public.user_persona FOR SELECT
    USING (user_id = auth.uid());

-- 用户可以创建自己的个人设定
CREATE POLICY "Users can insert their own persona"
    ON public.user_persona FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 用户可以更新自己的个人设定
CREATE POLICY "Users can update their own persona"
    ON public.user_persona FOR UPDATE
    USING (user_id = auth.uid());

-- 用户可以删除自己的个人设定
CREATE POLICY "Users can delete their own persona"
    ON public.user_persona FOR DELETE
    USING (user_id = auth.uid());

-- ================================================
-- 3. 触发器
-- ================================================

-- 应用 updated_at 自动更新触发器
CREATE TRIGGER update_user_persona_updated_at
    BEFORE UPDATE ON public.user_persona
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 自动更新 last_updated 字段
CREATE OR REPLACE FUNCTION update_persona_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_persona_last_updated_trigger
    BEFORE UPDATE ON public.user_persona
    FOR EACH ROW
    EXECUTE FUNCTION update_persona_last_updated();

-- ================================================
-- Migration Complete
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'User Persona Migration Completed!';
    RAISE NOTICE 'Added:';
    RAISE NOTICE '  - user_persona table for digital twin configuration';
    RAISE NOTICE '  - RLS policies for user data isolation';
    RAISE NOTICE '  - Triggers for automatic timestamp updates';
    RAISE NOTICE '==================================================';
END
$$;
