import { v4 as uuid } from 'uuid';

import { IClient, IRoom, IRoomOptions } from './room';

type TRooms = { [key: string]: IRoom };

const roomsPublic: TRooms = {};
const roomsPrivate: TRooms = {};

const addRoom = (rooms: TRooms, room: IRoom) => {
  if (rooms[room.id]) {
    throw 'room with this id already exists';
  }

  rooms[room.id] = room;
};

const createRoom = (client: IClient, options: IRoomOptions) => {
  const room: IRoom = {
    id: uuid(),
    players: [client],
    options,
  };

  return room;
};

export const createPublicRoom = (client: IClient, options: IRoomOptions) => {
  const room = createRoom(client, options);

  addRoom(roomsPublic, room);

  return room;
};

export const createPrivateRoom = (client: IClient, options: IRoomOptions) => {
  const room = createRoom(client, options);

  addRoom(roomsPrivate, room);

  return room;
};

export const getRooms = () => ({
  public: roomsPublic,
  private: roomsPrivate,
});

export const addClientToPublicRoom = (roomId: string, client: IClient) => {
  const room = roomsPublic[roomId];

  if (!room) {
    throw 'room does not exist';
  }

  if (room.players.length === room.options.playersMax) {
    throw 'room is full';
  }

  room.players.push(client);

  return room;
};

export const removeClientFromPublicRoom = (roomId: string, client: IClient) => {
  const room = roomsPublic[roomId];

  if (!room) {
    throw 'room does not exist';
  }

  const playerIndex = room.players.indexOf(client);

  if (playerIndex < 0) {
    throw 'client was not found in room';
  }

  room.players.splice(playerIndex, 1);

  return room;
};
