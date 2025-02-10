<template>
  <div class="flex flex-col items-center justify-between gap-2">
    <el-button
      class="w-64 !m-0"
      v-for="(menuItem, mI) in menu"
      :key="mI"
      type="primary"
      @click="goTo(menuItem.title)"
    >
      {{ menuItem.title }}
    </el-button>

    <el-input v-model="roomStore.username" placeholder="Ваш никнейм" />

    <el-button
      :disabled="!roomStore.username"
      class="!mt-8 !m-0"
      type="primary"
      @click="goToRoomList"
    >
      Перейти к списку комнат
    </el-button>

    <div class="flex flex-wrap items-center gap-4">
      <Card v-for="(cardItem, cI) in cardData" :key="cI" :card-data="cardItem" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '../components/Card.vue'
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useRoomStore } from '@/stores/roomStore.ts'

const router = useRouter()
const roomStore = useRoomStore()

const menu = ref([])
const cardData = ref({})

const goTo = (menuItem: string) => {
  router.push({ name: 'settings-setting-edit', params: { settingName: menuItem } })
}

const goToRoomList = () => {
  router.push({ name: 'room-list' })
}

onBeforeMount(async () => {
  menu.value = (await axios.get('http://localhost:3000/setting')).data
})
</script>

<style scoped></style>
