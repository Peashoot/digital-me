import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/ChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/views/AuthCallbackView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 等待用户状态初始化完成
  if (!userStore.initialized) {
    await userStore.initialize()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !userStore.isLoggedIn) {
    // 需要登录但未登录,跳转到登录页
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if (to.name === 'Login' && userStore.isLoggedIn) {
    // 已登录用户访问登录页,跳转到首页
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
