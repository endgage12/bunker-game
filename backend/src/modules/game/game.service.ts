// import { Card } from '../../app.service';
import { Socket } from 'socket.io';
import { Player } from '../../schemes/Player';
import { SettingsService } from '../settings/setting.service';

export interface Card {
  id: number;
  title: string;
  isRevealed: boolean;
  value: string;
}

export class GameService {
  private roomId: string;
  private players: Player[] = [];
  private isStarted: boolean = false;

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

    for (const pl of this.players) {
      pl.card = await Promise.all([
        {
          id: 0,
          title: 'Профессия',
          value: await settingsService.getRandom('profession'),
          isRevealed: false,
        },
        {
          id: 1,
          title: 'Хобби',
          value: await settingsService.getRandom('hobby'),
          isRevealed: false,
        },
        {
          id: 2,
          title: 'Пол',
          value: await settingsService.getRandom('gender'),
          isRevealed: false,
        },
        {
          id: 3,
          title: 'Здоровье',
          value: await settingsService.getRandom('health'),
          isRevealed: false,
        },
        {
          id: 4,
          title: 'Фобии',
          value: await settingsService.getRandom('fear'),
          isRevealed: false,
        },
        {
          id: 5,
          title: 'Рюкзак',
          value: await settingsService.getRandom('bag'),
          isRevealed: false,
        },
        {
          id: 6,
          title: 'Инвентарь',
          value: await settingsService.getRandom('inventory'),
          isRevealed: false,
        },
        {
          id: 7,
          title: 'Спец. карта',
          value: await settingsService.getRandom('super-possibility'),
          isRevealed: false,
        },
      ]);
    }
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

    const cardFounded = this.players[playerIndex].card.find(
      (c) => c.id === newData.id,
    );

    if (!cardFounded) return;

    cardFounded.value = newData.value;
    cardFounded.isRevealed = newData.isRevealed;
    console.log(uuid, this.players[playerIndex], newData);
  }

  hideEnemiesCards(player: Socket, { uuid }: { uuid: string }) {
    this.players = this.players.map((p) => ({
      ...p,
      card:
        p.id === uuid
          ? p.card
          : p.card.map((c) => ({
              ...c,
              value: c.isRevealed ? c.value : 'Скрыто',
            })),
    }));
  }
}
