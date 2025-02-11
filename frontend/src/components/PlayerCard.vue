<template>
  <div
    class="flex flex-col items-center gap-2 border rounded-lg p-4 min-w-[320px] w-[calc(25%-2em)]"
  >
    <span>{{ player.username }}</span>
    <span>{{ player.kickVotes }}</span>
    <span>Выгнан: {{ player.isKicked }}</span>

    <div
      class="w-full flex items-start gap-2 whitespace-nowrap"
      v-for="(card, cI) in player.card"
      :key="cI"
    >
      <div class="flex items-center justify-center w-2/3 h-8 rounded-md bg-gray-300">
        {{ card.title }}
      </div>
      <span class="flex items-center justify-center w-2/3 h-8 rounded-md bg-gray-300">
        {{ card.value }}
      </span>

      <el-button
        v-if="!card.isRevealed && player.id === uuid && isFocused && gamePhase === 'revealing'"
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
</template>

<script setup lang="ts">
import type { Player } from '@/types/playerType.ts'
import type { Card } from '@/types/cardType.ts'

const props = defineProps({
  player: { type: Player, required: true },
})

const emit = defineEmits(['reveal-card', 'vote-for-kick'])

const revealCard = (card: Card) => {
  emit('reveal-card', card)
}

const voteForKick = (playerId: string) => {
  emit('vote-for-kick', playerId)
}
</script>

<style scoped></style>
