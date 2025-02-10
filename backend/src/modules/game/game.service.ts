import { Socket } from 'socket.io';
import { Player } from '../../schemes/Player';
import { SettingsService } from '../settings/setting.service';
import axios from 'axios';

export interface Card {
  id: number;
  title: string;
  isRevealed: boolean;
  value: string;
}

export class GameService {
  private roomId: string;
  private players: Player[] = [];
  private playersCards: Map<string, Card[]> = new Map();
  private isStarted: boolean = false;
  private idPlayerInFocus: string = '';

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
      vote: 'kick player 1',
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

  async cardGenerate(settingsService: SettingsService) {
    this.isStarted = true;

    const settings =
      <object[]>(await axios.get('http://localhost:3000/setting'))?.data || [];
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

  setFocusToPlayer() {
    if (!this.players.length) return;
    if (!this.idPlayerInFocus) {
      this.idPlayerInFocus = this.players[0].id;
      return;
    }

    const currentIndex = this.players.findIndex(
      (p) => p.id === this.idPlayerInFocus,
    );
    const nextIndex = (currentIndex + 1) % this.players.length;

    this.idPlayerInFocus = this.players[nextIndex].id;
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
}
