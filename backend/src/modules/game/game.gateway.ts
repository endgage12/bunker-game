import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService, Card } from './game.service';
import { SettingsService } from '../settings/setting.service';

@WebSocketGateway({ cors: true })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private rooms = new Map<string, GameService>();
  // private roomsState = new Map<string, GameService>();

  constructor(private readonly settingsService: SettingsService) {}

  afterInit(server: Server) {
    console.log(`WebSocket Gateway initialized`);
  }

  handleConnection(client: Socket) {
    const roomId = <string | undefined>client?.handshake?.auth?.roomId;
    const username = <string | undefined>client?.handshake?.auth?.username;
    const uuid = <string>client?.handshake?.auth?.uuid;
    if (!roomId || !username) {
      this.getRooms(client);
      client.disconnect();
      return;
    }

    const isRoomId = this.rooms.has(client?.handshake?.auth?.roomId);
    if (!isRoomId) {
      this.rooms.set(roomId, new GameService(roomId));
    }

    this.rooms.get(roomId)!.addPlayer(client, { username, uuid });

    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const roomId = client?.handshake?.auth?.roomId;
    const uuid = client?.handshake?.auth?.uuid;

    const isRoomId = this.rooms.has(roomId);
    if (!isRoomId) client.disconnect();

    const roomFounded = this.rooms.get(roomId);
    roomFounded?.removePlayer(client, { uuid });
    this.server.to(roomId).emit('playerJoined', this.rooms.get(roomId));

    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('startGame')
  async startGame(client: Socket) {
    const roomId = client?.handshake?.auth?.roomId;

    await this.rooms.get(roomId)!.cardGenerate(this.settingsService);
    this.rooms.get(roomId)!.setFocusToPlayer();
    this.server.to(roomId).emit('gameStarted', this.rooms.get(roomId));

    // @ts-expect-error
    const clients: Socket[] = await this.server.fetchSockets();
    this.rooms.get(roomId)!.sendCardToPlayers(clients);
  }

  @SubscribeMessage('updateCard')
  async updateCard(
    client: Socket,
    { uuid, newData }: { uuid: string; newData: Card },
  ) {
    const roomId = client?.handshake?.auth?.roomId;

    this.rooms.get(roomId)!.updateCard(client, { uuid, newData });
    this.rooms.get(roomId)!.setFocusToPlayer();
    this.server.to(roomId).emit('onCardUpdated', this.rooms.get(roomId));

    // @ts-expect-error
    const clients: Socket[] = await this.server.fetchSockets();
    this.rooms.get(roomId)!.sendCardToPlayers(clients);
  }

  @SubscribeMessage('getRooms')
  getRooms(client: Socket) {
    client.emit(
      'onGetRooms',
      [...this.rooms].map(([name, value]) => ({
        roomId: name,
        players: value,
      })),
    );
  }

  @SubscribeMessage('joinRoom')
  joinRoom(client: Socket, { roomId, uuid }: { roomId: string; uuid: string }) {
    const roomFounded = this.rooms.get(roomId);
    if (!roomFounded) {
      client.emit('error', 'Комната не найдена');
      return;
    }

    // this.rooms.get(roomId)!.hideEnemiesCards(client, { uuid });
    this.server.to(roomId).emit('playerJoined', this.rooms.get(roomId));
  }

  // @SubscribeMessage('createRoom')
  // async handleCreateRoom(client: Socket, playerName: string) {
  //   const roomId = this.generateRoomId();
  //
  //   const card = await this.gameService.generateSingleCard();
  //
  //   const player: Player = {
  //     id: client.id,
  //     name: playerName,
  //     isHost: true,
  //
  //     card,
  //     ready: false,
  //   };
  //
  //   this.rooms.set(roomId, Room);
  //   client.join(roomId);
  //   client.emit('roomCreated', { roomId, player });
  //   return { roomId };
  // }

  // @SubscribeMessage('joinRoom')
  // async handleJoinRoom(
  //   client: Socket,
  //   { roomId, playerName }: { roomId: string; playerName: string },
  // ) {
  //   const room = await this.roomService.findById(roomId);
  //   if (!room) {
  //     client.emit('error', 'Room not found');
  //     return;
  //   }
  //
  //   if (!JSON.parse(room.players)) {
  //     room.players = '[]';
  //   }
  //
  //   if (room.gameStarted) {
  //     client.emit('error', 'Game already started');
  //     return;
  //   }
  //
  //   const card = await this.gameService.generateSingleCard();
  //   const player: Player = {
  //     id: client.id,
  //     name: playerName,
  //     isHost: false,
  //
  //     card,
  //     ready: false,
  //   };

  //   room.players = JSON.stringify([...JSON.parse(room.players), player]);
  //   client.join(roomId);
  //   await this.roomService.updatePlayers(room.roomId, room.players);
  //   this.server.to(roomId).emit('playerJoined', this.getRoom(room));
  //   return this.getRoom(room);
  // }
  // @SubscribeMessage('startGame')
  // handleStartGame(client: Socket, roomId: string) {
  //   const room = this.rooms.get(roomId);
  //   if (!room || !JSON.parse(room.players).includes(client.id)?.isHost) {
  //     client.emit('error', 'Not authorized');
  //     return;
  //   }
  //
  //   room.gameStarted = true;
  //   room.currentRound = 1;
  //   this.server.to(roomId).emit('gameStarted', this.getRoom(room));
  // }

  // @SubscribeMessage('revealCard')
  // handleRevealCard(
  //   client: Socket,
  //   { roomId, cardType }: { roomId: string; cardType: keyof Card },
  // ) {
  //   const room = this.rooms.get(roomId);
  //   if (!room || !room.gameStarted) return;
  //
  //   const player = JSON.parse(room.players).find(
  //     (p: Player) => p.id === client.id,
  //   );
  //   if (player && !room.revealedCards.includes(cardType)) {
  //     JSON.parse(room.revealedCards).push(cardType);
  //     this.server.to(roomId).emit('cardRevealed', {
  //       playerId: client.id,
  //       cardType,
  //       value: player.card[cardType],
  //     });
  //   }
  // }
  //
  // @SubscribeMessage('submitVote')
  // handleSubmitVote(
  //   client: Socket,
  //   { roomId, votedPlayerId }: { roomId: string; votedPlayerId: string },
  // ) {
  //   const room = this.rooms.get(roomId);
  //   if (!room || !room.gameStarted) return;
  //
  //   const votingPlayer = JSON.parse(room.players).find(
  //     (p: Player) => p.id === client.id,
  //   );
  //   if (votingPlayer) {
  //     votingPlayer.vote = votedPlayerId;
  //     this.checkVotingCompletion(roomId);
  //   }
  // }
  //
  // @SubscribeMessage('changePlayerReady')
  // async changePlayerReady(
  //   client: Socket,
  //   { roomId, player }: { roomId: string; player: Player },
  // ): Promise<Player[] | null> {
  //   const room = await this.roomService.findById(roomId);
  //
  //   if (!room) return null;
  //
  //   if (!JSON.parse(room.players)) {
  //     room.players = '[]';
  //   }
  //
  //   const players: Player[] = JSON.parse(room.players);
  //   const findIndex = players.findIndex((p: Player) => p.id === player.id);
  //   players[findIndex].ready = !players[findIndex].ready;
  //
  //   await this.roomService.updatePlayers(room.roomId, JSON.stringify(players));
  //   return players;
  // }
  //
  // private checkVotingCompletion(roomId: string) {
  //   const room = this.rooms.get(roomId);
  //   if (!room) return;
  //
  //   const allVoted = Array.from(JSON.parse(room.players)).every(
  //     (p: Player) => p.vote,
  //   );
  //   if (allVoted) {
  //     this.calculateResults(roomId);
  //   }
  // }
  //
  // private calculateResults(roomId: string) {
  //   const room = this.rooms.get(roomId);
  //   if (!room) return;
  //
  //   const votes = Array.from(JSON.parse(room.players))
  //     .filter((p: Player) => p.vote)
  //     .map((p: Player) => p.vote);
  //
  //   // Логика подсчета голосов
  //   const results = votes.reduce((acc, vote) => {
  //     // @ts-ignore eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //     acc[vote] = (acc[vote] || 0) + 1;
  //     return acc;
  //   }, {});
  //
  //   this.server.to(roomId).emit('votingResults', results);
  //   this.prepareNextRound(roomId);
  // }
  //
  // private prepareNextRound(roomId: string) {
  //   const room = this.rooms.get(roomId);
  //   if (!room) return;
  //
  //   room.currentRound++;
  //   room.revealedCards = '';
  //   Array.from(JSON.parse(room.players)).forEach(
  //     (p: Player) => (p.vote = undefined),
  //   );
  //   this.server.to(roomId).emit('nextRound', this.getRoom(room));
  // }
  //
  // private getRoom(room: Room) {
  //   return {
  //     players: Array.isArray(JSON.parse(room.players))
  //       ? JSON.parse(room.players).map((p: Player) => ({
  //           id: p.id,
  //           name: p.name,
  //           isHost: p.isHost,
  //           ready: p.ready,
  //           vote: p.vote,
  //         }))
  //       : [],
  //     gameStarted: room.gameStarted,
  //     currentRound: room.currentRound,
  //     revealedCards: room.revealedCards,
  //   };
  // }
  //
  // private generateRoomId(): string {
  //   return Math.random().toString(36).substr(2, 6).toUpperCase();
  // }
  private handleLeaveRoom(client: Socket, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // JSON.parse(room.players).delete(client.id);
    // if (!JSON.parse(room.players).length) {
    //   this.rooms.delete(roomId);
    // } else {
    //   this.server.to(roomId).emit('playerLeft', this.getRoom(room));
    // }
  }
}
