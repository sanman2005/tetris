import * as listeners from 'api/listeners';
import Actions, { TAction } from 'api/actions';
import { createRoom, IRoom, IRoomOptions, IData } from './room';
import { IPlayer } from './player';

type TRooms = { [key: string]: IRoom };
type TPlayers = { [key: string]: IPlayer };

interface ILobby {
  addPlayer: (player: IPlayer) => void;
  getPublicRooms: () => object;
  removePlayer: (player: IPlayer) => void;
}

const MAX_ROOMS_COUNT_TO_SEND = 20;

class Lobby {
  rooms: TRooms = {};
  roomsPublic: TRooms = {};
  roomsPrivate: TRooms = {};
  players: TPlayers = {};

  constructor() {
    listeners.addReceiveListener(Actions.roomCreate, this.createRoom);
    listeners.addReceiveListener(Actions.roomJoin, this.addPlayerToRoom);
    listeners.addReceiveListener(Actions.roomLeave, this.removePlayerFromRoom);
  }

  addPlayer = (player: IPlayer) => {
    if (this.players[player.id]) {
      throw new Error('player with this id already exists');
    }

    this.players[player.id] = player;
    player.send(Actions.lobbyUpdate, this.getPublicRooms());
  }

  removePlayer = (player: IPlayer) => {
    if (!this.players[player.id]) {
      throw new Error('player with this id does not exists');
    }

    delete this.players[player.id];

    if (player.room) {
      this.removePlayerFromRoom({ player, data: null });
    }
  }

  addRoom = (room: IRoom) => {
    if (this.rooms[room.id]) {
      throw new Error('room with this id already exists');
    }

    const rooms = room.options.private ? this.roomsPrivate : this.roomsPublic;

    rooms[room.id] = room;
    this.rooms[room.id] = room;
  }

  createRoom = ({ player, data }: IData<IRoomOptions>) => {
    const room = createRoom(data);

    this.addRoom(room);
    room.start();
    this.addPlayerToRoom({ player, data: { roomId: room.id } });
  }

  addPlayerToRoom = ({ player, data }: IData<{ roomId: string }>) => {
    if (player.room) {
      throw new Error('player is already in another room');
    }

    const room = this.rooms[data.roomId];

    if (!room) {
      throw new Error('room does not exist');
    }

    room.addPlayer(player);
    this.sendLobby();
  }

  removePlayerFromRoom = ({ player }: IData) => {
    const { room } = player;

    if (!room) {
      throw new Error('player has no room');
    }

    room.removePlayer(player);

    if (room.isEmpty) {
      delete this.roomsPublic[room.id];
      delete this.roomsPrivate[room.id];
      delete this.rooms[room.id];
    }

    this.sendLobby();
  }

  sendLobby = () => {
    const roomsPublic = this.getPublicRooms();

    this.sendToPlayers(Actions.lobbyUpdate, roomsPublic);
  }

  sendToPlayers = (action: TAction, data: object) =>
    Object.values(this.players).forEach(
      player => !player.room && player.send(action, data),
    )

  getPublicRooms = () =>
    Object.values(this.roomsPublic)
      .filter(room => !room.isFull && !room.isClosed)
      .slice(0, MAX_ROOMS_COUNT_TO_SEND)
      .map(room => ({
        id: room.id,
        playersCount: room.players.length,
        title: room.options.title,
      }))
}

export default new Lobby() as ILobby;
