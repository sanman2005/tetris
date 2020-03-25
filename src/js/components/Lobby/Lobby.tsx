import * as React from 'react';

import * as apiSocket from 'js/apiSocket';
import * as apiListeners from 'js/apiListeners';

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
