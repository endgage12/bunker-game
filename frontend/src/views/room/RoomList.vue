<template>
  <div class="flex flex-col gap-2">
    <el-card>
      <el-page-header @back="goToMain">
        <template #content>
          <span class="font-600"> Список комнат </span>
        </template>

        <template #extra>
          <el-button :icon="Plus" type="primary" @click="createRoom"> Создать комнату </el-button>
        </template>
      </el-page-header>
    </el-card>

    <el-card body-class="flex flex-col gap-4">
      <span>Все комнаты</span>

      <div class="flex flex-col-reverse gap-2">
        <div
          v-for="(room, rI) in roomList"
          :key="rI"
          class="flex items-center justify-between gap-2"
        >
          <span>{{ room.roomId }}</span>
          <el-button type="primary" @click="joinRoom(room.roomId)">Присоединиться</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue'
import socketService from '@/services/socket.service.ts'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useRoomStore } from '@/stores/roomStore.ts'
import type { Room } from '@/types/roomType.ts'

const router = useRouter()
const route = useRoute()
const roomStore = useRoomStore()

const roomList = ref<Room[]>([])

const goToMain = () => {
  router.push({ name: 'main-page' })
}

const createRoom = () => {
  router.push({
    name: 'room-by-id',
    params: { roomId: Math.random().toString(36).substr(2, 6).toUpperCase() },
  })
}

const joinRoom = (roomId: string) => {
  router.push({ name: 'room-by-id', params: { roomId } })
}

const onGetRooms = () => {
  socketService.onGetRooms((rooms: Room[]): void => {
    roomList.value = rooms
  })
}

onMounted(() => {
  socketService.init()
  socketService.getRooms()
  onGetRooms()
})
</script>
