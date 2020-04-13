'use strict';

import * as WebSocket from 'ws';

import { server as serverConfig } from '../../../config/app.config.json';
import * as listeners from 'api/listeners';
import { TAction } from 'api/actions';
import lobby from './lobby';
import Player from './player';

const { port } = serverConfig;
const wss = new WebSocket.Server({ port });

const logError = (error: Error) => {
  console.error(error);
};

const sendSocket = (socket: any, action: TAction, data: object) =>
  socket.send(JSON.stringify({ action, data }));

wss.on('connection', (socket: WebSocket) => {
  const player = new Player((action, data) => sendSocket(socket, action, data));

  const onClose = () => {
    try {
      if (socket.readyState === socket.OPEN) {
        socket.close();
      } else {
        lobby.removePlayer(player);
      }
    } catch (e) {
      logError(e);
    }
  };

  socket.on('close', onClose);
  socket.on('error', onClose);

  socket.on('message', (message: string) => {
    try {
      const { action, data } = JSON.parse(message);

      listeners.notifyReceiveListeners(action, { player, data });
    } catch (e) {
      logError(e);
      onClose();
    }
  });

  try {
    lobby.addPlayer(player);
  } catch (e) {
    logError(e);
    socket.close();
  }
});

console.log('\n\n----- Server started! -----\n\n');
