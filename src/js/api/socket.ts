import { env } from 'js/helpers';
import { TAction } from './actions';
import * as listeners from './listeners';
import { server as apiConfig } from '../../../config/app.config.json';

const { production } = apiConfig.host;
const apiHost: string = (apiConfig.host as any)[env] || production;
const apiPort: number = apiConfig.port;
let ws: WebSocket = null;

export const connect = () => {
  if (ws && [ws.CONNECTING, ws.OPEN, ws.CLOSING].includes(ws.readyState)) {
    return;
  }

  ws = new WebSocket(`${apiHost}:${apiPort}`);

  ws.onopen = () => {
    listeners.notifyConnectListeners();
  };

  ws.onclose = () => {
    listeners.notifyDisconnectListeners();
    ws = null;
  };

  ws.onmessage = ({ data: rawData }) => {
    const { action, data } = JSON.parse(rawData);

    listeners.notifyReceiveListeners(action, data);
  };
};

export const isConnected = () => ws && ws.readyState === ws.OPEN;

export const send = (action: TAction, data: object = null) =>
  isConnected() && ws.send(JSON.stringify({ action, data }));
