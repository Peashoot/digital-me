import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { setLocale } from '@/i18n'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    profile: null,
    session: null,
    loading: false,
    error: null,
    initialized: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.session && !!state.user,
    username: (state) => state.profile?.username || state.user?.email || '',
    userId: (state) => state.user?.id || null,
    avatar: (state) => state.profile?.avatar_url || null,
    nickname: (state) => state.profile?.nickname || state.profile?.username || ''
  },

  actions: {
    async initialize() {
      this.loading = true
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        if (session) {
          this.session = session
          this.user = session.user
          await this.fetchProfile()
        }

        supabase.auth.onAuthStateChange((_event, session) => {
          this.session = session
          this.user = session?.user || null
          if (session) {
            this.fetchProfile()
          } else {
            this.profile = null
          }
        })

        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async loginWithGitHub() {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            scopes: 'user:email'
          }
        })

        if (error) throw error
        return { success: true, data }
      } catch (error) {
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      if (!this.user) return

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', this.user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        this.profile = data

        // Set user's language preference if available
        if (data?.language_preference) {
          setLocale(data.language_preference)
        }

        return { success: true, profile: data }
      } catch (error) {
        console.error('获取 profile 失败:', error)
        return { success: false, error: error.message }
      }
    },

    async updateProfile(updates) {
      if (!this.user) return { success: false, error: '未登录' }

      try {
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', this.user.id)
          .select()
          .single()

        if (error) throw error
        this.profile = data
        return { success: true, profile: data }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async logout() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error

        this.user = null
        this.profile = null
        this.session = null
        this.error = null

        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: this.error }
      }
    }
  }
})
