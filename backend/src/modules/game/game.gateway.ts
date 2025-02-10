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

  constructor(private readonly settingsService: SettingsService) {}

  afterInit() {
    console.log(`WebSocket Gateway initialized`);
  }

  handleConnection(client: Socket) {
    const roomId: string | undefined = client?.handshake?.auth?.roomId;
    const username: string | undefined = client?.handshake?.auth?.username;
    const uuid: string | undefined = client?.handshake?.auth?.uuid;
    if (!roomId || !username || !uuid) {
      this.getRooms();
      client.disconnect();
      return;
    }

    const isRoomId = this.rooms.has(roomId);
    if (!isRoomId) {
      this.rooms.set(roomId, new GameService(roomId));
      this.getRooms();
    }

    this.rooms.get(roomId)!.addPlayer(client, { username, uuid });
  }

  handleDisconnect(client: Socket) {
    const roomId: string | undefined = client?.handshake?.auth?.roomId;
    const uuid: string | undefined = client?.handshake?.auth?.uuid;
    if (!roomId || !uuid) {
      client.disconnect();
      return;
    }

    const isRoomId = this.rooms.has(roomId);
    if (!isRoomId) client.disconnect();

    const roomFounded = this.rooms.get(roomId);
    roomFounded?.removePlayer(client, { uuid });
    this.server.to(roomId).emit('onRoomDataUpdated', this.rooms.get(roomId));

    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('startGame')
  async startGame(client: Socket) {
    const roomId: string | undefined = client?.handshake?.auth?.roomId;
    if (!roomId) return;

    await this.rooms.get(roomId)!.cardGenerate(this.settingsService);
    this.rooms.get(roomId)!.setFocusToPlayer();
    this.rooms.get(roomId)!.setGamePhase('revealing');
    this.server.to(roomId).emit('onRoomDataUpdated', this.rooms.get(roomId));

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
    this.server.to(roomId).emit('onRoomDataUpdated', this.rooms.get(roomId));

    // @ts-expect-error
    const clients: Socket[] = await this.server.fetchSockets();
    this.rooms.get(roomId)!.sendCardToPlayers(clients);
  }

  @SubscribeMessage('getRooms')
  getRooms() {
    this.server.emit(
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

    this.server.to(roomId).emit('onRoomDataUpdated', this.rooms.get(roomId));
  }

  @SubscribeMessage('voteForKick')
  async voteForKick(client: Socket, { playerId }: { playerId: string }) {
    const roomId = client?.handshake?.auth?.roomId;
    const roomFounded = this.rooms.get(roomId);
    if (!roomFounded) {
      client.emit('error', 'Комната не найдена');
      return;
    }

    roomFounded.voteForKick(client, { playerId });
    this.rooms.get(roomId)!.setFocusToPlayer();
    this.server.to(roomId).emit('onRoomDataUpdated', this.rooms.get(roomId));

    // @ts-expect-error
    const clients: Socket[] = await this.server.fetchSockets();
    this.rooms.get(roomId)!.sendCardToPlayers(clients);
  }
}
