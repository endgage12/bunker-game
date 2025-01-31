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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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
</script>

<style scoped></style>
