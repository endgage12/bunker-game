<template>
  <div>
    <div>{{ roomId }}</div>
    <div v-if="players.length">
      <h3>Игроки в комнате:</h3>
      <ul>
        <li v-for="player in players" :key="player.id">{{ player.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onUnmounted, onMounted } from 'vue'
import socketService from '@/services/socket.service.ts'

const props = defineProps({
  roomId: { type: String, required: true },
})

const players = ref<any[]>([])

const joinRoom = async () => {
  try {
    await socketService.joinRoom(
      props.roomId,
      Math.random().toString(36).substr(2, 6).toUpperCase(),
    )
  } catch (error) {
    alert(error.message)
  }
}

const onPlayerJoined = () => {
  socketService.onPlayerJoined((room: object) => {
    players.value = room.players
  })
}

onBeforeMount(async () => {
  socketService.init()
  onPlayerJoined()
})

onMounted(async () => {
  await joinRoom()
})

onUnmounted(() => {
  socketService.disconnect()
})
</script>

<style scoped></style>
