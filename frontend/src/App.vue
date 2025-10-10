<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 监听视口高度变化（处理移动端键盘弹出）
  const setVH = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  setVH()
  window.addEventListener('resize', setVH)
  window.addEventListener('orientationchange', setVH)
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
