import { v4 as uuid } from 'uuid';

import { createRoom, IClient, IRoom, IRoomOptions } from './room';

type TRooms = { [key: string]: IRoom };

const roomsPublic: TRooms = {};
const roomsPrivate: TRooms = {};

const addRoom = (rooms: TRooms, room: IRoom) => {
  if (rooms[room.id]) {
    throw new Error('room with this id already exists');
  }

  rooms[room.id] = room;
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

export const addClientToPublicRoom = (roomId: string, client: IClient) => {
  const room = roomsPublic[roomId];

  if (!room) {
    throw new Error('room does not exist');
  }

  room.addPlayer(client);

  return room;
};

export const removeClientFromPublicRoom = (roomId: string, client: IClient) => {
  const room = roomsPublic[roomId];

  if (!room) {
    throw new Error('room does not exist');
  }

  room.removePlayer(client);

  return room;
};

export const getPublicRooms = () =>
  Object.values(roomsPublic).map(room => ({
    id: room.id,
    playersCount: room.players.length,
    title: room.options.title,
  }));
