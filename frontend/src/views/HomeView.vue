<template>
  <div class="flex flex-col gap-2 w-full">
    <el-button @click="openAddModal">Create profession</el-button>
    <el-table :data="professions" style="width: 100%">
      <el-table-column prop="text" label="Profession" />
      <el-table-column align="right">
        <template #default="scope">
          <el-button size="small" @click="openEditModal(scope.row)"> Edit </el-button>
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

  <el-dialog class="flex flex-col gap-2" v-model="addModalVisible" :modal="true">
    <el-input v-model="addModalData.text" placeholder="Profession" />

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addModalVisible = false">Cancel</el-button>
        <el-button type="primary" @click="professionCreate" @keyup.enter="professionCreate">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog class="flex flex-col gap-2" v-model="editModalVisible" :modal="true">
    <el-input v-model="editModalData.text" placeholder="Profession" />

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editModalVisible = false">Cancel</el-button>
        <el-button type="primary" @click="professionUpdate" @keyup.enter="professionUpdate">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onBeforeMount, type Ref, ref } from 'vue'
import { debounce } from 'lodash'

interface addModalData {
  text: string
}

interface editModalData {
  text: string
}

const professions = ref([])
const professionPaginationCurrentPage = ref(1)
const addModalVisible = ref(false)
const addModalData = ref({
  text: '',
})
const editModalVisible = ref(false)
const editModalData = ref({
  text: '',
})

const openAddModal = () => {
  addModalVisible.value = true
  addModalData.value = { text: '' }
}

const openEditModal = (data: editModalData) => {
  editModalVisible.value = true
  editModalData.value = data
}

const professionCreate = async () => {
  await axios.post('http://localhost:3000/profession/create?test=true', {
    text: addModalData.value.text,
  })

  addModalVisible.value = false
  professions.value = await professionGetAll()
}

const professionUpdate = async (data: editModalData) => {
  await axios.post('http://localhost:3000/profession/update', editModalData.value)
  editModalVisible.value = false
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
