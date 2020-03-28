export type TAction = string | number;

enum actions {
  roomCreate,
  roomsGet,
  roomJoin,
  roomLeave,
  lobbyUpdate,
}

export default actions;
