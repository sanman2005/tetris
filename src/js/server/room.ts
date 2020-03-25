import { v4 as uuid } from 'uuid';

export interface IClient {

}

export interface IRoomOptions {
  playersMax: number;
  title: string;
}

export interface IRoom {
  id: string;
  players: IClient[];
  options: IRoomOptions;
  addPlayer: (player: IClient) => void;
  removePlayer: (player: IClient) => void;
}

export const createRoom = (client: IClient, options: IRoomOptions) => {
  const room: IRoom = {
    id: uuid(),
    players: [client],
    options,
    addPlayer(player) {
      if (this.players.length === this.options.playersMax) {
        throw new Error('room is full');
      }

      this.players.push(player);
    },
    removePlayer(player) {
      const playerIndex = this.players.indexOf(player);

      if (playerIndex < 0) {
        throw new Error('client was not found in room');
      }

      this.players.splice(playerIndex, 1);
    },
  };

  return room;
};
