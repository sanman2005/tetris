import * as listeners from 'api/listeners';
import actions from 'api/actions';
import { createRoom, IRoom, IRoomOptions, IData } from './room';

type TRooms = { [key: string]: IRoom };

interface ILobby {
  getPublicRooms: () => object;
}

class Lobby {
  rooms: TRooms = {};
  roomsPublic: TRooms = {};
  roomsPrivate: TRooms = {};

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
    const room = createRoom(player, data);

    this.addRoom(room);
  }

  addPlayerToRoom = ({
    player,
    data,
  }: IData<{ roomId: string }>) => {
    const room = this.rooms[data.roomId];

    if (!room) {
      throw new Error('room does not exist');
    }

    room.addPlayer(player);

    return room;
  }

  removePlayerFromRoom = ({
    player,
    data,
  }: IData<{ roomId: string }>) => {
    const room = this.rooms[data.roomId];
    const rooms = room.options.private ? this.roomsPrivate : this.roomsPublic;

    if (!room) {
      throw new Error('room does not exist');
    }

    room.removePlayer(player);

    return room;
  }

  getPublicRooms = () =>
    Object.values(this.roomsPublic).map(room => ({
      id: room.id,
      playersCount: room.players.length,
      title: room.options.title,
    }))
}

export default new Lobby() as ILobby;
