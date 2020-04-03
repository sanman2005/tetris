export type TAction = string | number;

enum actions {
  lobbyUpdate,
  roomCreate,
  roomJoin,
  roomLeave,
  gameUpdateClient,
  gameUpdateServer,
  smile,
}

export default actions;
