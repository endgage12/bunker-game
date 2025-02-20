import { Socket } from 'socket.io';
import { Player } from '../../schemes/Player';
import { SettingsService } from '../settings/setting.service';
import axios from 'axios';
import { causesOfDisaster } from '../../localbase/disasters';
import { sendMessage } from '../../utilities/chatGpt';
import type { Disaster } from '../../schemes/Disaster';

export interface Card {
  id: number;
  title: string;
  isRevealed: boolean;
  value: string;
}

export class GameService {
  private roomId: string;
  private disaster: Disaster | null = null;
  private players: Player[] = [];
  private playersCards: Map<string, Card[]> = new Map();
  private isStarted: boolean = false;
  private isEnded: boolean = false;
  private idPlayerInFocus: string = '';
  private gamePhase: string = 'lobby';
  private chatGptData: string = '';

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  addPlayer = (
    player: Socket,
    { username, uuid }: { username: string; uuid: string },
  ) => {
    const existingPlayer = this.players.find((p) => p.id === uuid);

    if (this.isStarted && !existingPlayer) {
      console.log('Игра уже началась, вы не сможете к ней подключиться');
      return;
    }

    if (!this.isStarted && existingPlayer) {
      console.log('Перезаходим в лобби');
      return;
    }

    if (this.isStarted && existingPlayer) {
      console.log('Переподключение...');
      player.join(this.roomId);
      return;
    }

    this.players.push({
      id: uuid,
      username,
      card: [],
      isHost: !!this.players.length,
      isKicked: false,
      vote: 'kick player 1',
      kickVotes: 0,
      ready: false,
    });

    player.join(this.roomId);
    console.log(`Joined player: ${uuid}`);
  };

  removePlayer = (player: Socket, { uuid }: { uuid: string }) => {
    if (this.isStarted) return;

    this.players = this.players.filter((p) => p.id !== uuid);

    player.leave(this.roomId);
    console.log(`Removed player: ${uuid}`);
  };

  disasterGenerate() {
    const randomIndex = Math.floor(Math.random() * causesOfDisaster.length);
    this.disaster = causesOfDisaster[randomIndex];
  }

  async sendMessageToGpt(promptText: string) {
    this.chatGptData = await sendMessage(promptText, {
      playersCards: this.playersCards,
      disaster: this.disaster,
    });
  }

  async cardGenerate(settingsService: SettingsService) {
    this.isStarted = true;
    const apiURL = process.env.API_URL;

    const settings =
      <object[]>(await axios.get(`${apiURL}/setting`))?.data || [];
    for (const pl of this.players) {
      this.playersCards.set(
        pl.id,
        await Promise.all(
          settings.map(async (s: Card, id: number) => ({
            id,
            title: s.title,
            value: await settingsService.getRandom(s.title),
            isRevealed: false,
          })),
        ),
      );

      pl.card = settings.map((s: Card, id: number) => ({
        id,
        title: s.title,
        value: 'Скрыто',
        isRevealed: false,
      }));
    }
  }

  setGamePhase(phase: string) {
    this.gamePhase = phase;
  }

  finishGame() {
    this.isEnded = true;
  }

  setFocusToPlayer() {
    if (!this.players.length) return;

    // Если фокус не установлен, начинаем с первого НЕ выгнанного игрока
    if (!this.idPlayerInFocus) {
      const firstActivePlayer = this.players.find((p) => !p.isKicked);
      if (firstActivePlayer) this.idPlayerInFocus = firstActivePlayer.id;
      return;
    }

    const activePlayers = this.players.filter((p) => !p.isKicked);
    const currentIndex = activePlayers.findIndex(
      (p) => p.id === this.idPlayerInFocus,
    );
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    const isNextRound = nextIndex === 0;

    if (isNextRound && this.gamePhase === 'voting') {
      // Собираем голоса только для активных игроков
      const activePlayers = this.players.filter((p) => !p.isKicked);
      let maxVotes = 0;
      let candidates: { isKicked: boolean }[] = [];

      activePlayers.forEach((player) => {
        if (player.kickVotes > maxVotes) {
          maxVotes = player.kickVotes;
          candidates = [player];
        } else if (player.kickVotes === maxVotes) {
          candidates.push(player);
        }
      });

      if (candidates.length === 1 && maxVotes > 0) {
        candidates[0].isKicked = true;
        this.resetVotes();
      } else {
        // Ничья
        this.resetVotes();
      }
    }

    if (isNextRound)
      this.gamePhase = this.gamePhase === 'voting' ? 'revealing' : 'voting';

    const nextPlayer = activePlayers[nextIndex];
    this.idPlayerInFocus = nextPlayer?.id;
  }

  resetVotes() {
    this.players.forEach((p) => (p.kickVotes = 0));
  }

  voteForKick(player: Socket, { playerId }: { playerId: string }) {
    const foundPlayer = this.players.find((p) => p.id === playerId);
    if (!foundPlayer) return;

    foundPlayer.kickVotes = foundPlayer.kickVotes + 1;
  }

  getMyCard({ uuid }: { uuid: string }) {
    const playerIndex = this.players.findIndex((p) => p.id === uuid);
    if (playerIndex === -1) {
      console.log('Игрок не найден');
      return;
    }

    return this.playersCards.get(uuid);
  }

  updateCard(
    player: Socket,
    { uuid, newData }: { uuid: string; newData: Card },
  ) {
    const playerIndex = this.players.findIndex((p) => p.id === uuid);
    if (playerIndex === -1) {
      console.log('Игрок не найден');
      return;
    }

    // Обновляем состояние комнаты
    const cardFounded = this.players[playerIndex].card.find(
      (c) => c.id === newData.id,
    );
    if (!cardFounded) return;

    cardFounded.value = newData.value;
    cardFounded.isRevealed = newData.isRevealed;

    // Обновляем состояние карты игрока
    const cardFoundedPlayer = this.playersCards
      .get(uuid)
      ?.find((c) => c.id === newData.id);
    if (!cardFoundedPlayer) return;

    cardFoundedPlayer.value = newData.value;
    cardFoundedPlayer.isRevealed = newData.isRevealed;
  }

  sendCardToPlayers(clients: Socket[]) {
    clients.forEach((c) => {
      if (!c.handshake.auth.uuid) return;
      c.emit(
        'onGetMyCard',
        this.getMyCard({
          uuid: c.handshake.auth.uuid,
        }),
      );
    });
  }

  getActivePlayers() {
    return this.players.filter((p) => !p.isKicked);
  }
}
