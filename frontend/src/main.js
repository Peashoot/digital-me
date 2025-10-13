import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入样式
import './styles/main.css'

// 创建应用实例
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')
