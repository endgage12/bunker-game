<template>
  <div class="flex flex-col gap-2 w-full">
    <el-button class="inline-flex" type="primary" @click="openAddModal">
      Create {{ settingName }}
    </el-button>
    <el-table :data="settingData" style="width: 100%">
      <el-table-column prop="text" :label="settingName" />
      <el-table-column align="right">
        <template #default="scope">
          <el-button size="small" @click="openEditModal(scope.row)"> Edit </el-button>
          <el-button size="small" type="danger" @click="rowRemove(scope.row.id)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="paginationCurrentPage"
      background
      layout="prev, pager, next"
      :total="settingData.length"
    />
  </div>

  <el-dialog class="flex flex-col gap-2" v-model="addModalVisible" :modal="true">
    <el-input v-model="addModalData.text" placeholder="Profession" />

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addModalVisible = false">Cancel</el-button>
        <el-button type="primary" @click="settingCreate" @keyup.enter="settingCreate">
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
        <el-button type="primary" @click="settingUpdate" @keyup.enter="settingUpdate">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onBeforeMount, type Ref, ref, toRefs } from 'vue'
import { debounce } from 'lodash'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  settingName: { type: String, required: true },
})
const { settingName } = toRefs(props)

const router = useRouter()
const route = useRoute()

interface addModalData {
  text: string
}

interface editModalData {
  text: string
}

const settingData = ref([])
const paginationCurrentPage = ref(1)
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

const settingCreate = async () => {
  await axios.post(`http://localhost:3000/${settingName.value}/create?test=true`, {
    text: addModalData.value.text,
  })

  addModalVisible.value = false
  settingData.value = await settingGetAll()
}

const settingUpdate = async (data: editModalData) => {
  await axios.post(`http://localhost:3000/${settingName.value}/update`, editModalData.value)
  editModalVisible.value = false
}

const rowRemove = async (id: number) => {
  await axios.post(`http://localhost:3000/${settingName.value}/remove`, { id })

  settingData.value = await settingGetAll()
}

const settingGetAll = async () => {
  const res = await axios.get(`http://localhost:3000/${settingName.value}`)
  return res?.data
}

onBeforeMount(async () => {
  settingData.value = await settingGetAll()
  console.log(settingName.value)
})
</script>
