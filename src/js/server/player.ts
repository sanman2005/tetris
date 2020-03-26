import { TAction } from 'api/actions';

export interface IPlayer {
  send: (action: TAction, data: object) => void;
}

export default class Player {
  send: IPlayer['send'];

  constructor(send: IPlayer['send']) {
    this.send = send;
  }
}
