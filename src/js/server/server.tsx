'use strict';
import * as webSocket from 'ws';
import * as React from 'react';

import { server as serverConfig } from '../../config/app.config.json';
import * as lobby from './lobby';

const { port } = serverConfig;
const wss = new webSocket.Server({ port });

const getPublicRooms = () => {
  const { public: rooms } = lobby.getRooms();

  return Object.values(rooms).map(room => ({
    id: room.id,
    playersCount: room.players.length,
  }));
};

wss.on('connection', (socket, request, client) => {
  socket.on('message', message => {
    console.log('received: %s', message);
  });

  const publicRooms = getPublicRooms();

  socket.send(JSON.stringify(publicRooms));
});
