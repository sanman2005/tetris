import * as React from 'react';

import * as apiSocket from 'api/socket';
import * as apiListeners from 'api/listeners';

interface ILobbyState {
  connected: boolean;
}

export default class Lobby extends React.Component {
  state: ILobbyState = {
    connected: false,
  };

  componentDidMount() {
    apiListeners.addConnectListener(this.onConnect);
    apiListeners.addDisconnectListener(this.onDisconnect);
    apiListeners.addReceiveListener('lobby', this.onReceive);
    apiSocket.connect();
  }

  componentWillUnmount() {
    apiListeners.removeConnectListener(this.onConnect);
    apiListeners.removeDisconnectListener(this.onDisconnect);
    apiListeners.removeReceiveListener('lobby', this.onReceive);
  }

  onConnect = () => this.setState({ connected: true });

  onDisconnect = () => {
    this.setState({ connected: false });
    apiSocket.connect();
  }

  onReceive = (data: object) => {
    console.log(data);
  }

  render() {
    return <div className='lobby'></div>;
  }
}
