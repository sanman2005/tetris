export type TAction = string | number;

enum actions {
  lobbyUpdate,
  roomCreate,
  roomJoin,
  roomLeave,
  gameGet,
  gameUpdate,
  smile,
}

export default actions;
