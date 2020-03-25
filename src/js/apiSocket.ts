import { env } from './helpers';
import { server as apiConfig } from '../../config/app.config.json';

type IListener = () => void;
type IReceiveListener = (data?: object) => void;

const { production } = apiConfig.host;
const apiHost: string = (apiConfig.host as any)[env] || production;
const apiPort: number = apiConfig.port;
const listeners: {
  connect: IListener[];
  disconnect: IListener[];
  receive: { [key: string]: IReceiveListener[] };
} = {
  connect: [],
  disconnect: [],
  receive: {},
};
let ws: WebSocket = null;

export const connect = () => {
  const socket = new WebSocket(`${apiHost}:${apiPort}`);

  socket.onopen = () => {
    ws = socket;
    listeners.connect.forEach(listener => listener());
  };

  socket.onclose = () => {
    ws = null;
    listeners.disconnect.forEach(listener => listener());
  };

  socket.onmessage = ({ data: rawData }) => {
    const { action, data } = JSON.parse(rawData);
    const actionListeners = listeners.receive[action];

    if (actionListeners) {
      actionListeners.forEach(listener => listener(data));
    }
  };
};

export const isConnected = () => ws && ws.OPEN;

export const send = (action: string, data: object) =>
  ws && ws.send(JSON.stringify({ action, data }));

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
  action: string,
  callback: IReceiveListener,
) => {
  const actionListeners = listeners.receive[action] || [];

  if (!actionListeners.includes(callback)) {
    actionListeners.push(callback);
    listeners.receive[action] = actionListeners;
  }
};

export const removeReceiveListener = (
  action: string,
  callback: IReceiveListener,
) => {
  const actionListeners = listeners.receive[action] || [];
  const index = actionListeners.indexOf(callback);

  if (index >= 0) {
    actionListeners.splice(index, 1);
  }
};
