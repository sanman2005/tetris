import { env } from './helpers';
import * as listeners from './apiListeners';
import { server as apiConfig } from '../../config/app.config.json';

const { production } = apiConfig.host;
const apiHost: string = (apiConfig.host as any)[env] || production;
const apiPort: number = apiConfig.port;
let ws: WebSocket = null;

export const connect = () => {
  const socket = new WebSocket(`${apiHost}:${apiPort}`);

  socket.onopen = () => {
    ws = socket;
    listeners.notifyConnectListeners();
  };

  socket.onclose = () => {
    ws = null;
    listeners.notifyDisconnectListeners();
  };

  socket.onmessage = ({ data: rawData }) => {
    const { action, data } = JSON.parse(rawData);
    listeners.notifyReceiveListeners(action, data);
  };
};

export const isConnected = () => ws && ws.OPEN;

export const send = (action: string, data: object) =>
  ws && ws.send(JSON.stringify({ action, data }));