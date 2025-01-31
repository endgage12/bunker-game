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

    <el-button class="!mt-8" type="primary" @click="cardGenerate('profession')">
      Сгенерировать карточку
    </el-button>
  </div>
</template>

<script setup lang="ts">
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

const goTo = (menuItem: string) => {
  router.push({ name: 'settings-setting-edit', params: { settingName: menuItem } })
}

const cardGenerate = async (title: string) => {
  await axios.post(`http://localhost:3000/card/generate`, { title })
}
</script>

<style scoped></style>
