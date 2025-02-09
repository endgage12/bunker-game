// import { Card } from '../../app.service';
import { Socket } from 'socket.io';
import { Player } from '../../schemes/Player';
import { SettingsService } from '../settings/setting.service';

interface Card {
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
      card: {},
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
          title: 'Профессия',
          value: await settingsService.getRandom('profession'),
          isRevealed: false,
        },
        {
          title: 'Хобби',
          value: await settingsService.getRandom('hobby'),
          isRevealed: false,
        },
        {
          title: 'Пол',
          value: await settingsService.getRandom('gender'),
          isRevealed: false,
        },
        {
          title: 'Здоровье',
          value: await settingsService.getRandom('health'),
          isRevealed: false,
        },
        {
          title: 'Фобии',
          value: await settingsService.getRandom('fear'),
          isRevealed: false,
        },
        {
          title: 'Рюкзак',
          value: await settingsService.getRandom('bag'),
          isRevealed: false,
        },
        {
          title: 'Инвентарь',
          value: await settingsService.getRandom('inventory'),
          isRevealed: false,
        },
        {
          title: 'Спец. карта',
          value: await settingsService.getRandom('super-possibility'),
          isRevealed: false,
        },
      ]);
    }
  }

  updateCard(player: Socket, newData: Card[]) {
    console.log(newData);
  }
}
