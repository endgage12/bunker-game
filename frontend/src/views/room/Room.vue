<template>
  <div class="flex flex-col items-center justify-center gap-2 flex-wrap">
    <el-tag v-if="gamePhase === 'revealing'" type="info">
      Обсуждение и раскрытие характеристик
    </el-tag>
    <el-tag v-if="gamePhase === 'voting'" type="danger">Голосование за изгнание</el-tag>

    <div class="w-full" v-if="players.length">
      <div class="w-full flex items-start justify-center flex-wrap gap-2">
        <div
          class="relative flex flex-col items-center gap-4 border rounded-lg shadow p-4 min-w-[320px] w-[calc(25%-2em)]"
          :class="{
            'border-blue-500': player.id === uuid,
            'border-gray-300': player.id !== uuid,
          }"
          v-for="player in players"
          :key="player.id"
        >
          <el-image
            v-if="player.isKicked"
            :src="knapsack"
            style="position: absolute; margin: auto; top: 10%; opacity: 50%"
          />

          <div class="w-full flex items-center justify-between">
            <div class="flex items-center justify-between gap-2">
              <el-icon>
                <User />
              </el-icon>
              <el-badge :show-zero="false" :value="player.kickVotes">
                <span>{{ player.username }}</span>
              </el-badge>
            </div>
            <el-tag v-if="player.id === idPlayerInFocus" type="danger"> Ход игрока </el-tag>
          </div>

          <div
            class="w-full flex items-start gap-2 whitespace-nowrap"
            v-for="(card, cI) in player.card"
            :key="cI"
          >
            <div class="flex items-center justify-center h-8 aspect-square rounded-md bg-gray-400">
              <el-popover placement="left-start" :content="card.title" trigger="hover">
                <template #reference>
                  <el-icon>
                    <InfoFilled />
                  </el-icon>
                </template>
              </el-popover>
            </div>

            <el-button
              class="!border-b-4 w-full"
              :disabled="
                card.isRevealed || player.id !== uuid || !isFocused || gamePhase !== 'revealing'
              "
              @click="revealCard(card)"
            >
              {{ card.value }}
            </el-button>
          </div>

          <el-button
            type="danger"
            class="!border-b-4 !border-solid !border-red-700"
            v-if="player.id !== uuid && gamePhase === 'voting' && isFocused && !player.isKicked"
            @click="voteForKick(player.id)"
          >
            Выгнать
          </el-button>

          <el-button
            v-if="player.id === uuid && isFocused && !player.isKicked"
            class="!border-b-4 !border-solid !m-0"
            @click="voteForKick('')"
          >
            Пропустить
          </el-button>
        </div>
      </div>
    </div>

    <el-button v-if="!isStartedGame" type="primary" @click="startGame"> Начать игру </el-button>
  </div>

  <el-dialog v-model="isUsernameModalVisible" :modal="true" title="Введите никнейм">
    <el-input v-model="username" placeholder="Ваш никнейм" />
    <template v-slot:footer>
      <el-button type="primary" @click="reloadPage"> Присоединиться </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Edit, User, InfoFilled } from '@element-plus/icons-vue'
import knapsack from '@/assets/images/knapsack.webp'
import { ref, onBeforeMount, onUnmounted, onMounted, computed } from 'vue'
import socketService from '@/services/socket.service.ts'
import { useRoomStore } from '@/stores/roomStore.ts'
import { storeToRefs } from 'pinia'
import router from '@/router'
import type { Card } from '@/types/cardType.ts'
import type { Room } from '@/types/roomType.ts'

const props = defineProps({
  roomId: { type: String, required: true },
})

const roomStore = useRoomStore()
const { isStartedGame, username, uuid, currentPlayer, players, isFocused } = storeToRefs(roomStore)

const isUsernameModalVisible = ref(false)
const gamePhase = ref('')
const idPlayerInFocus = ref('')

const usernamePlayerInFocus = computed(
  () => players.value.find((p) => p.id === idPlayerInFocus.value)?.username,
)

const joinRoom = () => {
  if (!username.value) return

  socketService.joinRoom(props.roomId, username.value)
}

const voteForKick = (id: string) => {
  socketService.voteForKick(id)
}

const onRoomDataUpdated = () => {
  socketService.onRoomDataUpdated((room: Room): void => {
    isStartedGame.value = room.isStarted
    players.value = room.players
    isFocused.value = room.idPlayerInFocus === uuid.value
    idPlayerInFocus.value = room.idPlayerInFocus
    gamePhase.value = room.gamePhase
  })
}

const onGetMyCard = () => {
  socketService.onGetMyCard((cards: Card[]): void => {
    currentPlayer.value = { ...currentPlayer.value, card: cards }
  })
}

const startGame = () => {
  socketService.startGame()
}

const revealCard = (card: Card) => {
  card.isRevealed = true
  updateCard(card)
}

const updateCard = (card: Card) => {
  socketService.updateCard(uuid.value, card)
}

const reloadPage = () => {
  router.go(0)
}

onBeforeMount(async () => {
  isUsernameModalVisible.value = !username.value
  if (!username.value) return

  socketService.init()
  onRoomDataUpdated()
  onGetMyCard()
  joinRoom()
})

onUnmounted(() => {
  socketService.disconnect()
})
</script>

<style scoped></style>
