<template>
  <div class="flex flex-col items-center justify-center gap-2 flex-wrap">
    <div class="flex items-center gap-2">
      <span v-if="disaster?.title">{{ disaster.title }}</span>

      <el-popover
        v-if="disaster?.title"
        width="320"
        effect="dark"
        :content="disaster?.description"
        placement="bottom-start"
      >
        <template #reference>
          <el-button
            class="aspect-square w-[24px] h-[24px]"
            size="small"
            :icon="InfoFilled"
          ></el-button>
        </template>
      </el-popover>
    </div>

    <div class="flex items-center justify-center gap-2">
      <el-tag v-if="gamePhase === 'revealing' && !isEndedGame" type="info">
        Обсуждение и раскрытие характеристик
      </el-tag>
      <el-tag v-else-if="gamePhase === 'voting' && !isEndedGame" type="danger">
        Голосование за изгнание
      </el-tag>
      <el-tag v-else-if="isEndedGame" type="success"> Игра окончена </el-tag>
      <el-tag v-else type="warning"> Ожидание игроков </el-tag>
      <el-button v-if="chatGptData" type="warning" @click="isIncidentShowModal = true" size="small">
        А
      </el-button>
    </div>

    <div class="w-full" v-if="players.length">
      <div class="w-full flex items-start justify-center flex-wrap gap-2">
        <div
          class="relative flex flex-col items-center gap-4 border rounded-lg shadow p-4 min-w-[320px] w-[calc(25%-2em)] min-h-[360px]"
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
            <el-tag v-if="player.id === idPlayerInFocus && !isEndedGame" type="danger">
              Ход игрока
            </el-tag>
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
                card.isRevealed ||
                player.id !== uuid ||
                !isFocused ||
                gamePhase !== 'revealing' ||
                isEndedGame
              "
              @click="openAcceptRevealModal(card)"
            >
              {{ card.value }}
            </el-button>
          </div>

          <el-button
            type="danger"
            class="!border-b-4 !border-solid !border-red-700"
            v-if="
              player.id !== uuid &&
              gamePhase === 'voting' &&
              isFocused &&
              !player.isKicked &&
              !isEndedGame
            "
            @click="openAcceptKickModal(player)"
          >
            Выгнать
          </el-button>

          <el-button
            v-if="player.id === uuid && isFocused && !player.isKicked && !isEndedGame"
            class="!border-b-4 !border-solid !m-0"
            @click="openAcceptKickModal(null)"
          >
            Пропустить
          </el-button>
        </div>
      </div>
    </div>

    <el-button
      v-if="!isStartedGame"
      :disabled="players.length <= 2"
      type="primary"
      @click="startGame"
    >
      Начать игру
    </el-button>
  </div>

  <el-dialog
    v-if="!isMobile"
    v-model="isAcceptKickModal"
    :modal="true"
    :title="`Вы уверены, что хотите ${acceptKickModalData?.id ? `выгнать игрока ${acceptKickModalData.username}` : 'пропустить голосование'}?`"
  >
    <div class="flex items-center justify-between gap-2">
      <el-button class="w-1/2" @click="closeAcceptKickModal"> Нет </el-button>
      <el-button class="w-1/2" type="primary" @click="voteForKick(acceptKickModalData?.id)">
        Да
      </el-button>
    </div>
  </el-dialog>

  <el-drawer
    v-if="isMobile"
    v-model="isAcceptKickModal"
    :title="`Вы уверены, что хотите ${acceptKickModalData?.id ? `выгнать игрока ${acceptKickModalData.username}` : 'пропустить голосование'}?`"
    direction="btt"
  >
    <div class="flex items-center justify-between gap-2">
      <el-button class="w-1/2" @click="closeAcceptKickModal"> Нет </el-button>
      <el-button class="w-1/2" type="primary" @click="voteForKick(acceptKickModalData?.id)">
        Да
      </el-button>
    </div>
  </el-drawer>

  <el-dialog
    v-if="!isMobile"
    v-model="isAcceptRevealModal"
    :modal="true"
    title="Вы уверены, что хотите открыть эту характеристику?"
  >
    <div class="flex items-center justify-between gap-2">
      <el-button class="w-1/2" @click="closeAcceptDecisionModal"> Нет </el-button>
      <el-button class="w-1/2" type="primary" @click="revealCard(acceptRevealModalData)">
        Да
      </el-button>
    </div>
  </el-dialog>

  <el-drawer
    v-if="isMobile"
    v-model="isAcceptRevealModal"
    title="Вы уверены, что хотите открыть эту характеристику?"
    direction="btt"
  >
    <div class="flex items-center justify-between gap-2">
      <el-button class="w-1/2" @click="closeAcceptDecisionModal"> Нет </el-button>
      <el-button class="w-1/2" type="primary" @click="revealCard(acceptRevealModalData)">
        Да
      </el-button>
    </div>
  </el-drawer>

  <el-dialog
    v-if="!isMobile"
    v-model="isIncidentShowModal"
    :modal="true"
    title="Внимание! Происшествие!"
  >
    <div class="flex items-center justify-between gap-2">
      {{ chatGptData }}
    </div>
  </el-dialog>

  <el-drawer
    v-if="isMobile"
    v-model="isIncidentShowModal"
    title="Внимание! Происшествие!"
    direction="btt"
  >
    <div class="flex items-center justify-between gap-2">
      {{ chatGptData }}
    </div>
  </el-drawer>

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
import { ref, onBeforeMount, onUnmounted, onMounted, computed, watch } from 'vue'
import socketService from '@/services/socket.service.ts'
import { useRoomStore } from '@/stores/roomStore.ts'
import { storeToRefs } from 'pinia'
import router from '@/router'
import type { Card } from '@/types/cardType.ts'
import type { Room } from '@/types/roomType.ts'
import type { Player } from '@/types/playerType.ts'
import type { Disaster } from '@/types/disasterType.ts'
import { useChatGpt } from '@/utilities/useChatGpt.ts'

const props = defineProps({
  roomId: { type: String, required: true },
})

const roomStore = useRoomStore()
const {
  isStartedGame,
  isEndedGame,
  username,
  uuid,
  currentPlayer,
  players,
  isFocused,
  chatGptData,
} = storeToRefs(roomStore)

const chatGpt = useChatGpt()
const { sendMessage } = chatGpt

const isUsernameModalVisible = ref(false)
const isAcceptRevealModal = ref(false)
const isAcceptKickModal = ref(false)
const isIncidentShowModal = ref(false)
const isMobile = ref(false)
const disaster = ref<Disaster | null>(null)
const gamePhase = ref('')
const idPlayerInFocus = ref('')
const acceptRevealModalData = ref<Card | null>(null)
const acceptKickModalData = ref<Player | null>(null)

const usernamePlayerInFocus = computed(
  () => players.value.find((p) => p.id === idPlayerInFocus.value)?.username,
)

const joinRoom = () => {
  if (!username.value) return

  socketService.joinRoom(props.roomId, username.value)
}

const voteForKick = (id: string | undefined) => {
  socketService.voteForKick(id)
  closeAcceptKickModal()
}

const onRoomDataUpdated = () => {
  socketService.onRoomDataUpdated((room: Room): void => {
    isStartedGame.value = room.isStarted
    isEndedGame.value = room.isEnded
    isFocused.value = room.idPlayerInFocus === uuid.value
    idPlayerInFocus.value = room.idPlayerInFocus
    players.value = room.players
    disaster.value = room.disaster
    gamePhase.value = room.gamePhase
    chatGptData.value = room.chatGptData

    if (chatGptData.value !== room.chatGptData) isIncidentShowModal.value = true
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

const openAcceptRevealModal = (card: Card) => {
  acceptRevealModalData.value = card
  isAcceptRevealModal.value = true
}

const closeAcceptDecisionModal = () => {
  acceptRevealModalData.value = null
  isAcceptRevealModal.value = false
}

const openAcceptKickModal = (player: Player | null) => {
  acceptKickModalData.value = player
  isAcceptKickModal.value = true
}

const closeAcceptKickModal = () => {
  acceptKickModalData.value = null
  isAcceptKickModal.value = false
}

const revealCard = (card: Card | null) => {
  if (!card) return

  card.isRevealed = true
  updateCard(card)
  acceptRevealModalData.value = null
  isAcceptRevealModal.value = false
}

const updateCard = (card: Card) => {
  socketService.updateCard(uuid.value, card)
}

const reloadPage = () => {
  router.go(0)
}

onBeforeMount(async () => {
  isMobile.value = window.innerWidth < 768
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
