<template>
  <div class="flex flex-col gap-2">
    <el-page-header @back="goToMain">
      <template #content>
        <span class="font-600"> Список комнат </span>
      </template>

      <template #extra>
        <el-button :icon="Plus" type="primary" @click="createRoom"> Создать комнату </el-button>
      </template>
    </el-page-header>

    <span>Все комнаты</span>
    <div class="flex flex-col-reverse gap-2">
      <div v-for="(room, rI) in roomList" :key="rI" class="flex items-center gap-2">
        <span>{{ room.roomId }}</span>
        <el-button type="primary" @click="joinRoom(room.roomId)">Присоединиться</el-button>
      </div>
    </div>

    <el-input v-model="roomStore.username" placeholder="Ваш никнейм" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue'
import axios from 'axios'
import socketService from '@/services/socket.service.ts'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useRoomStore } from '@/stores/roomStore.ts'

const router = useRouter()
const route = useRoute()
const roomStore = useRoomStore()

interface RoomItem {
  roomId: string
  players?: Player[]
}

interface Player {
  id: string
  username: string
  ready: boolean
}

interface RoomData {
  players: Player[]
}

const roomData = ref<RoomData>({
  players: [],
  isHost: false,
})

const roomList = ref<RoomItem[]>([])

const goToMain = () => {
  router.push({ name: 'main-page' })
}

const createRoom = async () => {
  try {
    await router.push({
      name: 'room-by-id',
      params: { roomId: Math.random().toString(36).substr(2, 6).toUpperCase() },
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      alert(error.message)
    } else {
      alert('Неизвестная ошибка при создании комнаты')
    }
  }
}

const joinRoom = async (roomId: string) => {
  try {
    await router.push({ name: 'room-by-id', params: { roomId } })
  } catch (error: unknown) {
    if (error instanceof Error) {
      alert(error.message)
    } else {
      alert('Ошибка при переходе в комнату')
    }
  }
}

const onGetRooms = () => {
  socketService.onGetRooms((room: RoomItem[]): void => {
    roomList.value = room
  })
}

onMounted(() => {
  socketService.init()
  socketService.getRooms()
  onGetRooms()
  // socketService.onGameStateUpdate(handleGameState)
})
</script>
