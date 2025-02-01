<template>
  <el-button class="!mt-8 !m-0" type="primary" @click="createRoom">Создать комнату</el-button>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, toRefs } from 'vue'
import axios from 'axios'
import socketService from '@/services/socket.service.ts'

const props = defineProps({
  roomId: { type: String, required: true },
})
const { roomId } = toRefs(props)

const roomData = ref({
  roomId: '',
  players: 0,
  isHost: false,
})

const createRoom = async () => {
  try {
    const response = await socketService.createRoom('playerName')
    roomData.value.roomId = response.roomId
    roomData.value.isHost = true
  } catch (error) {
    alert(error.message)
  }
}

const handleGameState = () => {
  roomData.value.players += 1
}

onBeforeMount(async () => {
  roomData.value = await axios.get(`http://localhost:3000/room/${roomId.value}`)
})

onMounted(() => {
  socketService.init()
  socketService.onGameStateUpdate(handleGameState)
})
</script>

<style scoped></style>
