<template>
  <main>
    <TheWelcome />

    <el-button @click="professionCreate">Default</el-button>
  </main>
</template>

<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import axios from 'axios'

const professionCreate = async () => {
  const res = await axios.post('http://localhost:3000/profession/create?test=true', {
    data: 'test',
  })
  console.log(res?.data)
}
</script>
