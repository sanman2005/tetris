'use strict';

import * as WebSocket from 'ws';

import { server as serverConfig } from '../../../config/app.config.json';
import * as lobby from './lobby';
import * as listeners from '../apiListeners';

const { port } = serverConfig;
const wss = new WebSocket.Server({ port });

const sendSocket = (socket: any, action: string, data: object) =>
  socket.send(JSON.stringify({ action, data }));

const sendLobby = (socket: any) =>
  sendSocket(socket, 'lobby', lobby.getPublicRooms());

wss.on('connection', (socket: WebSocket, request: any) => {
  socket.on('close', () => {

  });

  socket.on('error', () => {
    if (socket.OPEN) {
      socket.close();
    }
  });

  socket.on('message', (message: string) => {
    const { action, data } = JSON.parse(message);

    listeners.notifyReceiveListeners(action, data);
  });

  sendLobby(socket);
});
