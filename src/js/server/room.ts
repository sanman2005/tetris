import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { v4 as uuid } from 'uuid';

import { IPlayer } from './player';
import Constants from 'js/constants';
import Game, { IGame } from '../components/Game';

export interface IData<T = object> {
  player: IPlayer;
  data: T;
}

export interface IRoomOptions {
  playersMax: number;
  private?: boolean;
  title: string;
}

export interface IRoom {
  id: string;
  isFull: boolean;
  isEmpty: boolean;
  game?: IGame;
  options: IRoomOptions;
  players: IPlayer[];
  addPlayer: (player: IPlayer) => void;
  removePlayer: (player: IPlayer) => void;
  start: () => void;
}

export const createRoom = (options: IRoomOptions) => {
  if (!options.title) {
    throw new Error('room title is empty');
  }

  options.title = options.title.slice(0, Constants.roomTitleLengthMax);
  options.playersMax = Math.max(
    Math.min(Math.floor(options.playersMax), Constants.roomPlayersMax),
    2,
  );

  const room: IRoom = {
    id: uuid(),
    players: [],
    options,
    get isFull() {
      return this.players.length === this.options.playersMax;
    },
    get isEmpty() {
      return !this.players.length;
    },
    addPlayer(player) {
      if (this.isFull) {
        throw new Error('room is full');
      }

      if (this.players.includes(player)) {
        throw new Error('player is already in this room');
      }

      player.changeRoom(room);
      this.players.push(player);
      this.game.playerAdd(player.id);
    },
    removePlayer(player) {
      console.log(this);
      const playerIndex = this.players.indexOf(player);

      if (playerIndex < 0) {
        throw new Error('player was not found in room');
      }

      this.game.playerRemove(player.id);
      this.players.splice(playerIndex, 1);
      player.changeRoom(null);

      if (this.isEmpty) {
        this.game.end();
      }
    },
    start() {
      const onInit = (game: IGame) => {
        this.game = game;
        game.start();
      };

      const gameElement = React.createElement(
        Game,
        { room: this, server: true, onInit },
        null,
      );

      renderToStaticMarkup(gameElement);
    },
  };

  return room;
};
