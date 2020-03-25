import * as React from 'react';

import {
  addConnectListener,
  addDisconnectListener,
  addReceiveListener,
  connect,
  removeConnectListener,
  removeDisconnectListener,
  removeReceiveListener,
  send,
} from 'js/apiSocket';

interface ILobbyState {
  connected: boolean;
}

export default class Lobby extends React.Component {
  state: ILobbyState = {
    connected: false,
  };

  componentDidMount() {
    addConnectListener(this.onConnect);
    addDisconnectListener(this.onDisconnect);
    addReceiveListener('lobby', this.onReceive);
    connect();
  }

  componentWillUnmount() {
    removeConnectListener(this.onConnect);
    removeDisconnectListener(this.onDisconnect);
    removeReceiveListener('lobby', this.onReceive);
  }

  onConnect = () => this.setState({ connected: true });

  onDisconnect = () => {
    this.setState({ connected: false });
    connect();
  }

  onReceive = (data: object) => {
    console.log(data);
  }

  render() {
    return <div className='lobby'></div>;
  }
}
