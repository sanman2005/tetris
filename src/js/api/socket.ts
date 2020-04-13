import { env } from 'js/helpers';
import { TAction } from './actions';
import * as listeners from './listeners';
import { server as apiConfig } from '../../../config/app.config.json';

const { production } = apiConfig.host;
const apiHost: string = (apiConfig.host as any)[env] || production;
let ws: WebSocket = null;

export const connect = () => {
  if (ws && ws.readyState !== ws.CLOSED) {
    return;
  }

  ws = new WebSocket(apiHost);

  window.onbeforeunload = function() {
    ws.onclose = () => null;
    ws.close();
  };

  ws.onopen = () => listeners.notifyConnectListeners();

  ws.onclose = () => {
    ws = null;
    listeners.notifyDisconnectListeners();
  };

  ws.onmessage = ({ data: rawData }) => {
    const { action, data } = JSON.parse(rawData);

    listeners.notifyReceiveListeners(action, data);
  };
};

export const isConnected = () => ws && ws.readyState === ws.OPEN;

export const send = (action: TAction, data: object = null) =>
  isConnected() && ws.send(JSON.stringify({ action, data }));
