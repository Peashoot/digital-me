<template>
  <n-config-provider>
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { onMounted } from 'vue'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { useUserStore } from './stores/user'
import { usePersonaStore } from './stores/persona'

const userStore = useUserStore()
const personaStore = usePersonaStore()

onMounted(async () => {
  // 监听视口高度变化（处理移动端键盘弹出）
  const setVH = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  setVH()
  window.addEventListener('resize', setVH)
  window.addEventListener('orientationchange', setVH)

  // 初始化 persona store（如果用户已登录）
  if (userStore.isLoggedIn) {
    await personaStore.fetchPersona()
  }
})
</script>

<style>
/* 移动端视口高度修正 */
:root {
  --vh: 1vh;
}

#app {
  width: 100%;
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
}
</style>
