<template>
  <div class="flex flex-col items-center justify-center gap-2 flex-wrap">
    <div v-if="isStartedGame">
      <div v-if="isFocused">Ваш ход</div>
      <div v-else>Ход за {{ usernamePlayerInFocus }}</div>
    </div>

    {{ gamePhase }}

    <div v-if="players.length">
      <div class="flex items-center gap-2">
        <div
          class="flex flex-col items-center gap-2 border rounded-lg p-4"
          v-for="player in players"
          :key="player.id"
        >
          <span>{{ player.username }}</span>
          <span>{{ player.kickVotes }}</span>
          <span>Выгнан: {{ player.isKicked }}</span>

          <div class="flex items-center gap-2" v-for="(card, cI) in player.card" :key="cI">
            <span class="whitespace-nowrap"> {{ card.title }}: {{ card.value }} </span>
            <el-button
              v-if="
                !card.isRevealed && player.id === uuid && isFocused && gamePhase === 'revealing'
              "
              @click="revealCard(card)"
            >
              Открыть
            </el-button>
          </div>

          <el-button
            v-if="player.id !== uuid && gamePhase === 'voting' && isFocused"
            @click="voteForKick(player.id)"
          >
            Выгнать
          </el-button>
        </div>
      </div>
    </div>

    <el-button v-if="!isStartedGame" type="primary" @click="startGame"> Start Game </el-button>
  </div>

  <el-dialog v-model="isUsernameModalVisible" :modal="true" title="Введите никнейм">
    <el-input v-model="username" placeholder="Ваш никнейм" />
    <template v-slot:footer>
      <el-button type="primary" @click="reloadPage"> Присоединиться </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
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
