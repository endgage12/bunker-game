<template>
  <div class="flex flex-col items-center justify-between gap-2">
    <el-button
      class="w-64 !m-0"
      v-for="(menuItem, mI) in menu"
      :key="mI"
      type="primary"
      @click="goTo(menuItem)"
    >
      {{ menuItem }}
    </el-button>

    <el-button class="!mt-8 !m-0" type="primary" @click="createRoom">Создать комнату</el-button>

    <el-button class="!m-0" type="primary" @click="cardGenerate">
      Сгенерировать карточки
    </el-button>

    <el-input class="!w-64" v-model="cardAmount" />

    <div class="flex flex-wrap items-center gap-4">
      <Card v-for="(cardItem, cI) in cardData" :key="cI" :card-data="cardItem" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '../components/Card.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const menu = ref([
  'profession',
  'hobby',
  'gender',
  'health',
  'fear',
  'bag',
  'inventory',
  'super-possibility',
])
const cardData = ref({})
const cardAmount = ref(0)

const goTo = (menuItem: string) => {
  router.push({ name: 'settings-setting-edit', params: { settingName: menuItem } })
}

const createRoom = async () => {
  await axios.post('http://localhost:3000/room/create', {})
}

const cardGenerate = async () => {
  cardData.value = (
    await axios.post(`http://localhost:3000/card/generate`, { amount: cardAmount.value })
  )?.data
}
</script>

<style scoped></style>
