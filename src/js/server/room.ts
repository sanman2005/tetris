import { v4 as uuid } from 'uuid';

import { IPlayer } from './player';

export interface IData<T> {
  player: IPlayer;
  data: T;
}

export interface IRoomOptions {
  playersMax: number;
  private: boolean;
  title: string;
}

export interface IRoom {
  id: string;
  isFull: boolean;
  players: IPlayer[];
  options: IRoomOptions;
  addPlayer: (player: IPlayer) => void;
  removePlayer: (player: IPlayer) => void;
}

export const createRoom = (options: IRoomOptions) => {
  const room: IRoom = {
    id: uuid(),
    players: [],
    options,
    get isFull() {
      return this.players.length === this.options.playersMax;
    },
    addPlayer(player) {
      if (this.isFull) {
        throw new Error('room is full');
      }

      this.players.push(player);
    },
    removePlayer(player) {
      const playerIndex = this.players.indexOf(player);

      if (playerIndex < 0) {
        throw new Error('player was not found in room');
      }

      this.players.splice(playerIndex, 1);
    },
  };

  return room;
};
