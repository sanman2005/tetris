export type TAction = string | number;

enum actions {
  lobbyUpdate = 'lobbyUpdate',
  roomCreate = 'roomCreate',
  roomJoin = 'roomJoin',
  roomLeave = 'roomLeave',
  gameGet = 'gameGet',
  gameUpdate = 'gameUpdate',
  smile = 'smile',
}

export default actions;
