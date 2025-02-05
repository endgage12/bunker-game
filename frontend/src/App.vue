<template>
  <el-config-provider :locale="ru">
    <RouterView />
  </el-config-provider>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ru from 'element-plus/es/locale/lang/ru'
import { ref } from 'vue'
</script>

<style scoped></style>
