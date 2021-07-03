import { TAction } from './actions';

export type IListener = () => void;
export type IReceiveListener = (data?: any) => void;

const listeners: {
  connect: IListener[];
  disconnect: IListener[];
  receive: { [key: string]: IReceiveListener[] };
} = {
  connect: [],
  disconnect: [],
  receive: {},
};

export const addConnectListener = (callback: IListener) =>
  !listeners.connect.includes(callback) && listeners.connect.push(callback);

export const removeConnectListener = (callback: IListener) => {
  const index = listeners.connect.indexOf(callback);

  if (index >= 0) {
    listeners.connect.splice(index, 1);
  }
};

export const addDisconnectListener = (callback: IListener) =>
  !listeners.disconnect.includes(callback) &&
  listeners.disconnect.push(callback);

export const removeDisconnectListener = (callback: IListener) => {
  const index = listeners.disconnect.indexOf(callback);

  if (index >= 0) {
    listeners.disconnect.splice(index, 1);
  }
};

export const addReceiveListener = (
  action: TAction,
  callback: IReceiveListener,
) => {
  const actionListeners = listeners.receive[action] || [];

  if (!actionListeners.includes(callback)) {
    actionListeners.push(callback);
    listeners.receive[action] = actionListeners;
  }
};

export const removeReceiveListener = (
  action: TAction,
  callback: IReceiveListener,
) => {
  const actionListeners = listeners.receive[action] || [];
  const index = actionListeners.indexOf(callback);

  if (index >= 0) {
    actionListeners.splice(index, 1);
  }
};

export const notifyConnectListeners = () =>
  listeners.connect.forEach(listener => listener());

export const notifyDisconnectListeners = () =>
  listeners.disconnect.forEach(listener => listener());

export const notifyReceiveListeners = (action: TAction, data: object) => {
  const actionListeners = listeners.receive[action];

  if (actionListeners) {
    actionListeners.forEach(listener => listener(data));
  }
};
