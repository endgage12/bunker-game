<template>
  <div class="flex items-start justify-start gap-2">
    <el-card class="hidden sm:flex flex-col items-center justify-between gap-2">
      <el-table :data="menu" style="width: 100%; min-width: 360px">
        <el-table-column label="Характеристика" prop="title" />

        <el-table-column label="Действие" align="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="goTo(scope.row.title)">
              Редактировать
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card>
      <el-input v-model="roomStore.username" placeholder="Ваш никнейм">
        <template #prepend>Кликуха</template>
      </el-input>

      <el-button
        :disabled="!roomStore.username"
        class="!mt-4 !m-0"
        type="primary"
        @click="goToRoomList"
      >
        Перейти к списку комнат
      </el-button>

      <div class="flex flex-wrap items-center gap-4">
        <Card v-for="(cardItem, cI) in cardData" :key="cI" :card-data="cardItem" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import Card from '../components/Card.vue'
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useRoomStore } from '@/stores/roomStore.ts'
import type { SettingsMenu } from '@/types/settingsMenu.ts'

const router = useRouter()
const roomStore = useRoomStore()

const apiURL: string = import.meta.env.VITE_APP_API_URL

const menu = ref<SettingsMenu[]>([])
const cardData = ref({})

const goTo = (menuItem: string) => {
  router.push({ name: 'settings-setting-edit', params: { settingName: menuItem } })
}

const goToRoomList = () => {
  router.push({ name: 'room-list' })
}

onBeforeMount(async () => {
  console.log(`'v0.2' ${apiURL}`)
  menu.value = (await axios.get(`${apiURL}/setting`)).data
})
</script>

<style scoped></style>
