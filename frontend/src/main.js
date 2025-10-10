import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

// 导入样式
import './styles/main.css'

// 创建应用实例
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化用户认证状态
const userStore = useUserStore()
userStore.initialize().then(() => {
  app.mount('#app')
})
