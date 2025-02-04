<template>
  <el-config-provider :locale="ru">
    <RouterView />
  </el-config-provider>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ru from 'element-plus/dist/locale/ru.mjs'
import { ref } from 'vue'
</script>

<style scoped></style>
