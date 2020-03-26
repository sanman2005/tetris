'use strict';

import * as WebSocket from 'ws';

import { server as serverConfig } from '../../../config/app.config.json';
import * as listeners from 'api/listeners';
import actions, { TAction } from 'api/actions';
import lobby from './lobby';
import Player from './player';

const { port } = serverConfig;
const wss = new WebSocket.Server({ port });

const sendSocket = (socket: any, action: TAction, data: object) =>
  socket.send(JSON.stringify({ action, data }));

const sendLobby = (socket: any) =>
  sendSocket(socket, actions.roomsGet, lobby.getPublicRooms());

wss.on('connection', (socket: WebSocket) => {
  const player = new Player((action, data) => sendSocket(socket, action, data));

  socket.on('close', () => {});

  socket.on('error', () => {
    if (socket.OPEN) {
      socket.close();
    }
  });

  socket.on('message', (message: string) => {
    const { action, data } = JSON.parse(message);

    listeners.notifyReceiveListeners(action, { player, data });
  });

  sendLobby(socket);
});
