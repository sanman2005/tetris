export type TAction = string | number;

enum actions {
  lobbyUpdate,
  roomCreate,
  roomJoin,
  roomLeave,
}

export default actions;
