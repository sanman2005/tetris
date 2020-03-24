export interface IClient {

}

export interface IRoomOptions {
  playersMax: number;
}

export interface IRoom {
  id: string;
  players: IClient[];
  options: IRoomOptions;
}

