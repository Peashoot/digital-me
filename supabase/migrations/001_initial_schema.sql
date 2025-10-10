-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. Users Table (用户核心信息表)
-- ================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ================================================
-- 2. User OAuth Connections Table (OAuth 平台绑定表)
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_oauth_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'github', 'google', 'gitlab' etc.
    provider_user_id VARCHAR(255) NOT NULL,
    provider_username VARCHAR(255),
    provider_email VARCHAR(255),
    provider_avatar_url TEXT,
    avatar_url TEXT, -- User's custom avatar for this connection
    contact_info VARCHAR(255), -- Phone, WeChat, QQ, etc.
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    metadata JSONB, -- Additional provider-specific data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_provider_user UNIQUE (provider, provider_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_user_id ON public.user_oauth_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_provider ON public.user_oauth_connections(provider);

-- ================================================
-- 3. Conversations Table (会话表)
-- ================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT '新对话',
    metadata JSONB, -- Store conversation settings, AI model, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- ================================================
-- 4. Messages Table (消息表)
-- ================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB, -- Store token count, model info, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT content_not_empty CHECK (char_length(content) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- ================================================
-- Row Level Security (RLS) Policies
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (id = auth.uid());

-- OAuth Connections Policies
CREATE POLICY "Users can view their own OAuth connections"
    ON public.user_oauth_connections FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own OAuth connections"
    ON public.user_oauth_connections FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own OAuth connections"
    ON public.user_oauth_connections FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own OAuth connections"
    ON public.user_oauth_connections FOR DELETE
    USING (user_id = auth.uid());

-- Conversations Policies
CREATE POLICY "Users can view their own conversations"
    ON public.conversations FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations"
    ON public.conversations FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own conversations"
    ON public.conversations FOR DELETE
    USING (user_id = auth.uid());

-- Messages Policies
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE user_id = auth.uid()
        )
    );

-- ================================================
-- Triggers for updated_at
-- ================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to user_oauth_connections table
CREATE TRIGGER update_oauth_connections_updated_at
    BEFORE UPDATE ON public.user_oauth_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to conversations table
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- Function: Auto-create user profile on signup
-- ================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, username, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created_mine
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- Function: Auto-create OAuth connection on signup
-- ================================================

CREATE OR REPLACE FUNCTION public.handle_new_oauth_user()
RETURNS TRIGGER AS $$
DECLARE
    provider_name TEXT;
BEGIN
    -- Extract provider from raw_app_meta_data
    provider_name := NEW.raw_app_meta_data->>'provider';

    IF provider_name IS NOT NULL THEN
        INSERT INTO public.user_oauth_connections (
            user_id,
            provider,
            provider_user_id,
            provider_username,
            provider_email,
            provider_avatar_url,
            metadata
        )
        VALUES (
            NEW.id,
            provider_name,
            NEW.raw_user_meta_data->>'provider_id',
            NEW.raw_user_meta_data->>'user_name',
            NEW.email,
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data
        )
        ON CONFLICT (provider, provider_user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create OAuth connection
CREATE TRIGGER on_auth_user_oauth_created_mine
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_oauth_user();

-- ================================================
-- Realtime Publication (启用实时订阅)
-- ================================================

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ================================================
-- Sample Data (可选，用于测试)
-- ================================================

-- 注意：生产环境中不需要插入测试数据
-- 这里注释掉，如果需要测试可以取消注释

/*
-- Insert sample user (for testing only)
INSERT INTO public.users (id, username, nickname, email)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'testuser',
    '测试用户',
    'test@example.com'
);

-- Insert sample conversation
INSERT INTO public.conversations (id, user_id, title)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '测试对话'
);

-- Insert sample messages
INSERT INTO public.messages (conversation_id, role, content)
VALUES
    ('00000000-0000-0000-0000-000000000002', 'user', '你好！'),
    ('00000000-0000-0000-0000-000000000002', 'assistant', '你好！我是 AI 助手，很高兴为你服务。有什么我可以帮助你的吗？');
*/

-- ================================================
-- Migration Complete
-- ================================================

-- 迁移完成提示
DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Database migration completed successfully!';
    RAISE NOTICE 'Tables created: users, user_oauth_connections, conversations, messages';
    RAISE NOTICE 'RLS policies enabled for all tables';
    RAISE NOTICE 'Triggers configured for updated_at and auto-creation';
    RAISE NOTICE 'Realtime enabled for messages table';
    RAISE NOTICE '==================================================';
END
$$;
