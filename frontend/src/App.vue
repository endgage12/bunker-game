<template>
  <el-config-provider :locale="ru">
    <RouterView />
  </el-config-provider>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ru from 'element-plus/es/locale/lang/ru'
import { onBeforeMount, ref } from 'vue'
import { useRoomStore } from '@/stores/roomStore.ts'
import { storeToRefs } from 'pinia'

const roomStore = useRoomStore()
const { uuid } = storeToRefs(roomStore)

const generateUUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2) // window.crypto.randomUUID(); работает только с https и localhost
}

onBeforeMount(() => {
  if (!uuid.value) uuid.value = generateUUID()
})
</script>

<style scoped></style>
