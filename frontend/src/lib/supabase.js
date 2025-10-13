/**
 * Supabase 客户端配置
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '缺少 Supabase 环境变量。请检查 .env.local 文件。\n' +
    '需要配置: VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce' // 使用 PKCE 流程，更安全
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'digital-me'
    }
  }
})

// 导出配置信息供其他模块使用
supabase.supabaseUrl = supabaseUrl
supabase.supabaseKey = supabaseAnonKey

export default supabase
