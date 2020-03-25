'use strict';

import * as WebSocket from 'ws';

import { server as serverConfig } from '../../../config/app.config.json';
import * as lobby from './lobby';

const { port } = serverConfig;

const wss = new WebSocket.Server({ port });

const getPublicRooms = () => {
  const { public: rooms } = lobby.getRooms();

  return Object.values(rooms).map(room => ({
    id: room.id,
    playersCount: room.players.length,
  }));
};

const sendSocket = (socket: any, action: string, data: object) =>
  socket.send(JSON.stringify({ action, data }));

const sendLobby = (socket: any) =>
  sendSocket(socket, 'lobby', getPublicRooms());

wss.on('connection', (socket: any, request: any, client: any) => {
  socket.on('message', (message: string) => {
    console.log('received: %s', message);
  });

  sendLobby(socket);
});
