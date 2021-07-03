import { v4 as uuid } from 'uuid';

import { TAction } from 'api/actions';
import { IRoom } from './room';

export interface IPlayer {
  id: string;
  changeRoom: (room: IRoom | null) => void;
  room: IRoom;
  send: (action: TAction, data: object) => void;
}

export default class Player {
  id: string;
  send: IPlayer['send'];
  room?: IRoom;

  constructor(send: IPlayer['send'], room?: IRoom) {
    this.id = uuid();
    this.room = room;
    this.send = send;
  }

  changeRoom = (room: IRoom) => {
    this.room = room;
  }
}
