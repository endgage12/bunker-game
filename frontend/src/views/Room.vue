<template>room</template>

<script setup lang="ts">
import { onBeforeMount, ref, toRefs } from 'vue'
import axios from 'axios'

const props = defineProps({
  roomId: { type: String, required: true },
})
const { roomId } = toRefs(props)

const roomData = ref(null)

onBeforeMount(async () => {
  roomData.value = await axios.get(`http://localhost:3000/room/${roomId.value}`)
})
</script>

<style scoped></style>
