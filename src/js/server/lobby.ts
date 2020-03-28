import * as listeners from 'api/listeners';
import actions from 'api/actions';
import { createRoom, IRoom, IRoomOptions, IData } from './room';
import { IPlayer } from './player';

type TRooms = { [key: string]: IRoom };
type TPlayers = { [key: string]: IPlayer };

interface ILobby {
  getPublicRooms: () => object;
}

const MAX_ROOMS_COUNT_TO_SEND = 20;

class Lobby {
  rooms: TRooms = {};
  roomsPublic: TRooms = {};
  roomsPrivate: TRooms = {};
  players: TPlayers = {};

  constructor() {
    listeners.addReceiveListener(actions.roomCreate, this.createRoom);
    listeners.addReceiveListener(actions.roomJoin, this.addPlayerToRoom);
    listeners.addReceiveListener(actions.roomLeave, this.removePlayerFromRoom);
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
    if (this.players[player.id]) {
      throw new Error('player with this id already exists');
    }

    const room = createRoom(data);

    this.addRoom(room);
    this.addPlayerToRoom({ player, data: { roomId: room.id }});
  }

  addPlayerToRoom = ({ player, data }: IData<{ roomId: string }>) => {
    const room = this.rooms[data.roomId];

    if (!room) {
      throw new Error('room does not exist');
    }

    if (this.players[player.id]) {
      throw new Error('player with this id already exists');
    }

    room.addPlayer(player);
    this.players[player.id] = player;
    player.changeRoom(room);

    this.sendLobby();

    return room;
  }

  removePlayerFromRoom = ({ player, data }: IData<{ roomId: string }>) => {
    const room = this.rooms[data.roomId];
    const rooms = room.options.private ? this.roomsPrivate : this.roomsPublic;

    if (!room) {
      throw new Error('room does not exist');
    }

    room.removePlayer(player);
    player.changeRoom(null);

    this.sendLobby();

    return room;
  }

  sendLobby = () => {
    const roomsPublic = this.getPublicRooms();

    Object.values(this.players).forEach(
      player => player.room && player.send(actions.lobbyUpdate, roomsPublic),
    );
  }

  getPublicRooms = () =>
    Object.values(this.roomsPublic)
      .filter(room => !room.isFull)
      .slice(0, MAX_ROOMS_COUNT_TO_SEND)
      .map(room => ({
        id: room.id,
        playersCount: room.players.length,
        title: room.options.title,
      }))
}

export default new Lobby() as ILobby;
