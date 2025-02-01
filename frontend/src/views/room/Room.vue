<template>
  <div>{{ roomId }}</div>
</template>

<script setup lang="ts">
import { onBeforeMount, toRefs } from 'vue'
import socketService from '@/services/socket.service.ts'

const props = defineProps({
  roomId: { type: String, required: true },
})
const { roomId } = toRefs(props)

const joinRoom = async () => {
  try {
    await socketService.joinRoom(roomId.value, 'host')
  } catch (error) {
    alert(error.message)
  }
}

onBeforeMount(async () => {
  await joinRoom()
})
</script>

<style scoped></style>
