<template>
  <div class="flex flex-col gap-2 w-full">
    <el-page-header @back="goToMain">
      <template #content>
        <span class="font-600"> Параметры игры </span>
      </template>

      <template #extra>
        <el-button class="inline-flex" type="primary" :icon="Plus" @click="openAddModal">
          Create {{ settingName }}
        </el-button>
      </template>
    </el-page-header>

    <el-table :data="settingData" style="width: 100%">
      <el-table-column prop="value" :label="settingName" />
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
    <el-input v-model="addModalData.value" placeholder="Value" />

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
    <el-input v-model="editModalData.value" placeholder="Value" />

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
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  settingName: { type: String, required: true },
})
const { settingName } = toRefs(props)

const router = useRouter()
const route = useRoute()

interface addModalData {
  title: string
  value: string
}

interface editModalData {
  title: string
  value: string
}

const settingData = ref([])
const paginationCurrentPage = ref(1)
const addModalVisible = ref(false)
const addModalData = ref({
  title: settingName.value,
  value: '',
})
const editModalVisible = ref(false)
const editModalData = ref({
  title: settingName.value,
  value: '',
})

const goToMain = () => {
  router.push({ name: 'main-page' })
}

const openAddModal = () => {
  addModalVisible.value = true
  addModalData.value = { title: settingName.value, value: '' }
}

const openEditModal = (data: editModalData) => {
  editModalVisible.value = true
  editModalData.value = data
}

const settingCreate = async () => {
  await axios.post(
    `http://localhost:3000/setting/${settingName.value}/create?test=true`,
    addModalData.value,
  )

  addModalVisible.value = false
  settingData.value = await settingGetAll()
}

const settingUpdate = async (data: editModalData) => {
  await axios.post(`http://localhost:3000/setting/${settingName.value}/update`, editModalData.value)
  editModalVisible.value = false
}

const rowRemove = async (id: number) => {
  await axios.post(`http://localhost:3000/setting/${settingName.value}/remove`, { id })

  settingData.value = await settingGetAll()
}

const settingGetAll = async () => {
  const res = await axios.get(`http://localhost:3000/setting/${settingName.value}`)
  return res?.data
}

onBeforeMount(async () => {
  settingData.value = await settingGetAll()
})
</script>
