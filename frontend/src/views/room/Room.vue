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

          <el-button v-if="!isStartedGame" type="primary" @click="toggleReady(player)">
            {{ player.ready ? 'Готов' : 'Не готов' }}
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
import type { Player } from '@/types/playerType.ts'
import type { Room } from '@/types/roomType.ts'

const props = defineProps({
  roomId: { type: String, required: true },
})

const roomStore = useRoomStore()
const { isStartedGame, username, uuid, currentPlayer, players, isFocused } = storeToRefs(roomStore)

const isUsernameModalVisible = ref(false)
const idPlayerInFocus = ref('')
const gamePhase = ref('')

const usernamePlayerInFocus = computed(() => {
  return players.value.find((p) => p.id === idPlayerInFocus.value)?.username
})

const joinRoom = () => {
  try {
    isUsernameModalVisible.value = !username.value
    if (isUsernameModalVisible.value) return

    socketService.joinRoom(props.roomId, username.value)
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message)
    } else {
      alert('Произошла неизвестная ошибка')
    }
  }
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
  console.log(card)
  socketService.updateCard(uuid.value, card)
}

const toggleReady = (player: Player) => {
  const updatedPlayer = { ...player, ready: !player.ready }
  socketService.changePlayerReady(props.roomId, updatedPlayer)
}

const reloadPage = () => {
  router.go(0)
}

onBeforeMount(async () => {
  if (!username.value) return

  socketService.init()
  onRoomDataUpdated()
  onGetMyCard()
})

onMounted(() => {
  joinRoom()
})

onUnmounted(() => {
  socketService.disconnect()
})
</script>

<style scoped></style>
