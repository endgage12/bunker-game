<template>
  <div class="flex flex-col gap-2 w-full">
    <el-button @click="professionCreate">Create profession</el-button>
    <el-table :data="professions" style="width: 100%">
      <el-table-column prop="text" label="Date" />
      <el-table-column prop="isActive" type="selection" label="Is active" />
      <el-table-column align="right">
        <template #default="scope">
          <el-button size="small"> Edit </el-button>
          <el-button size="small" type="danger" @click="professionRemove(scope.row.id)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="professionPaginationCurrentPage"
      background
      layout="prev, pager, next"
      :total="professions.length"
    />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onBeforeMount, ref } from 'vue'
import { debounce } from 'lodash'

const professions = ref([])
const professionPaginationCurrentPage = ref(1)

const professionCreate = async () => {
  await axios.post('http://localhost:3000/profession/create?test=true', {
    text: 'test1',
  })

  professions.value = await professionGetAll()
}

const professionRemove = async (id: number) => {
  await axios.post('http://localhost:3000/profession/remove', { id })

  professions.value = await professionGetAll()
}

const professionGetAll = async () => {
  const res = await axios.get('http://localhost:3000/profession')
  return res?.data
}

onBeforeMount(async () => {
  professions.value = await professionGetAll()
})
</script>
