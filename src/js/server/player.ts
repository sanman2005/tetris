import { v4 as uuid } from 'uuid';

import { TAction } from 'api/actions';
import { IRoom } from './room';

export interface IPlayer {
  id: string;
  changeRoom: (room: IRoom | null) => void;
  room: IRoom | null;
  send: (action: TAction, data: object) => void;
}

export default class Player implements IPlayer {
  id: IPlayer['id'];
  send: IPlayer['send'];
  room: IPlayer['room'];

  constructor(send: IPlayer['send'], room: IPlayer['room'] = null) {
    this.id = uuid();
    this.room = room;
    this.send = send;
  }

  changeRoom = (room: IRoom | null) => {
    this.room = room;
  }
}
