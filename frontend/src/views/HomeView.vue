<template>
  <main>
    <TheWelcome />

    <el-button @click="professionCreate">Create profession</el-button>
  </main>
</template>

<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import axios from 'axios'

const professionCreate = async () => {
  const res = await axios.post('http://localhost:3000/profession/create?test=true', {
    text: 'test1',
  })
  console.log(res?.data)
}
</script>
