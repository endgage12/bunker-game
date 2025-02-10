<template>
  <div class="flex flex-col items-center justify-center gap-2 flex-wrap">
    <div>{{ roomId }}</div>
    <div v-if="players.length">
      <h3>Игроки в комнате:</h3>
      <div class="flex items-center gap-2">
        <div
          class="flex flex-col items-center gap-2 border rounded-lg p-4"
          v-for="player in players"
          :key="player.id"
        >
          <span>{{ player.username }}</span>

          <div class="flex items-center gap-2" v-for="(card, cI) in player.card" :key="cI">
            <span class="whitespace-nowrap">
              {{ card.title }}: {{ card.isRevealed ? card.value : 'Не открыто' }}
            </span>
            <el-button v-if="!card.isRevealed && player.id === uuid" @click="revealCard(card)">
              Открыть
            </el-button>
          </div>

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

interface Card {
  title: string
  isRevealed: boolean
  value: string
}

interface Player {
  id: string
  username: string
  ready: boolean
  card: Card[]
}

interface Room {
  players: Player[]
}

const props = defineProps({
  roomId: { type: String, required: true },
})

const roomStore = useRoomStore()
const { isStartedGame, username, uuid } = storeToRefs(roomStore)

const players = ref<Player[]>([])
const isUsernameModalVisible = ref(false)

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

const onPlayerJoined = () => {
  socketService.onPlayerJoined((room: Room): void => {
    players.value = room.players
  })
}

const onPlayerChangeStatus = () => {
  socketService.onPlayerChangeStatus((room: Room): void => {
    players.value = room.players
  })
}

const onGameStarted = () => {
  socketService.onGameStarted((room: Room): void => {
    players.value = room.players
    isStartedGame.value = true
  })
}

const onCardUpdated = () => {
  socketService.onCardUpdated((room: Room): void => {
    players.value = room?.players
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
  onPlayerJoined()
  onGameStarted()
  onCardUpdated()
})

onMounted(() => {
  joinRoom()
})

onUnmounted(() => {
  socketService.disconnect()
})
</script>

<style scoped></style>
