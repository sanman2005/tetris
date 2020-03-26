'use strict';

import * as WebSocket from 'ws';

import { server as serverConfig } from '../../../config/app.config.json';
import actions from 'api/actions';
import * as lobby from './lobby';
import * as listeners from 'api/listeners';

const { port } = serverConfig;
const wss = new WebSocket.Server({ port });

const sendSocket = (socket: any, action: string | number, data: object) =>
  socket.send(JSON.stringify({ action, data }));

const sendLobby = (socket: any) =>
  sendSocket(socket, actions.roomsGet, lobby.getPublicRooms());

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
