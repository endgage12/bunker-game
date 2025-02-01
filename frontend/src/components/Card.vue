<template>
  <div
    class="flex flex-col gap-2 items-center border rounded-md px-4 py-2 border-b border-gray-200"
  >
    <div v-for="([key, value], cI) in Object.entries(cardData)" :key="cI">
      {{ key }}: {{ value }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  cardData: { type: Object, required: true },
})
</script>

<style scoped></style>
