<template>
  <div class="flex flex-col gap-2">
    <el-button class="!mt-8 !m-0" type="primary" @click="createRoom"> Создать комнату </el-button>

    <span>Все комнаты</span>
    <div class="flex flex-col-reverse gap-2">
      <div v-for="(room, rI) in roomList" :key="rI" class="flex items-center gap-2">
        <span>{{ room.roomId }}</span>
        <el-button type="primary" @click="joinRoom(room.roomId)">Присоединиться</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, toRefs } from 'vue'
import axios from 'axios'
import socketService from '@/services/socket.service.ts'
import { useRouter } from 'vue-router'

const router = useRouter()

const roomData = ref({
  players: 0,
  isHost: false,
})
const roomList = ref([])

const createRoom = async () => {
  try {
    await socketService.createRoom('playerName')
    roomData.value.isHost = true
    await getAllRooms()
  } catch (error) {
    alert(error.message)
  }
}

const joinRoom = async (roomId: number) => {
  try {
    await router.push({ name: 'room-by-id', params: { roomId } })
  } catch (error) {
    alert(error.message)
  }
}

const handleGameState = () => {
  roomData.value.players += 1
}

const getAllRooms = async () => {
  roomList.value = (await axios.get('http://localhost:3000/room/getList'))?.data
}

onBeforeMount(async () => {
  await getAllRooms()
})

onMounted(async () => {
  socketService.init()
  socketService.onGameStateUpdate(handleGameState)
})
</script>

<style scoped></style>
