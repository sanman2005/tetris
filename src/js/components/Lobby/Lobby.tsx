import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';

import Actions from 'api/actions';
import * as apiSocket from 'api/socket';
import * as apiListeners from 'api/listeners';
import i18n from 'js/i18n';
import Constants from 'js/constants';
import { pagesPath } from 'pages/index';

import Button from 'components/Button';
import { Form, TFormSubmit } from 'components/Form';
import CheckBox from 'components/CheckBox';
import { InputName } from 'components/Input';
import List from 'components/List';
import Loading from 'components/Loading';

export interface IRoom {
  id: string;
  playersCount: number;
  title: string;
}

interface ILobbyState {
  connected: boolean;
  creating: boolean;
  error: string;
  rooms: IRoom[];
}

class Lobby extends React.Component<RouteComponentProps, ILobbyState> {
  state: ILobbyState = {
    connected: null,
    creating: false,
    error: '',
    rooms: [],
  };

  componentDidMount() {
    apiListeners.addConnectListener(this.onConnect);
    apiListeners.addDisconnectListener(this.onDisconnect);
    apiListeners.addReceiveListener(Actions.lobbyUpdate, this.setRooms);
    apiSocket.connect();
  }

  componentWillUnmount() {
    apiListeners.removeConnectListener(this.onConnect);
    apiListeners.removeDisconnectListener(this.onDisconnect);
    apiListeners.removeReceiveListener(Actions.lobbyUpdate, this.setRooms);
  }

  onConnect = () => this.setState({ connected: true });

  onDisconnect = () => {
    this.setState({ connected: false });
    apiSocket.connect();
  }

  setRooms = (rooms: IRoom[]) => this.setState({ rooms });

  join = (roomId: string) => {
    apiSocket.send(Actions.roomJoin, { roomId });
    this.goToGame();
  }

  create: TFormSubmit = (data, onSuccessHook, onErrorHook) => {
    const params = {
      ...data,
      playersMax: data.playersMax ? Constants.roomPlayersMax : 2,
    };

    apiSocket.send(Actions.roomCreate, params);
    this.goToGame();
  }

  goToGame = () => this.props.history.push(`${pagesPath.game}/online`);

  renderRooms() {
    const { rooms } = this.state;

    return (
      <div className='lobby__rooms'>
        <List
          className='lobby__rooms-list'
          classItem='lobby__room'
          title={i18n`roomsAvailable`}
        >
          {rooms.map(room => (
            <div className='lobby__room-content' key={room.id}>
              <div className='lobby__room-title'>{room.title}</div>
              <div className='lobby__room-players'>
                {i18n`playersCount`}:<span>{room.playersCount}</span>
              </div>
              <Button text={i18n`join`} onClick={() => this.join(room.id)} />
            </div>
          ))}
        </List>

        <Button
          className='lobby__create'
          text={i18n`createRoom`}
          onClick={() => this.setState({ creating: true, error: '' })}
        />
      </div>
    );
  }

  renderCreating = () => (
    <div className='lobby__create'>
      <Form
        title={i18n`roomSettings`}
        error={this.state.error}
        fields={{
          title: (
            <InputName required maxLength={Constants.roomTitleLengthMax} />
          ),
          playersMax: (
            <CheckBox
              name='playersMax'
              labelOff={2}
              labelOn={Constants.roomPlayersMax}
              toggleStyle
              toggleLabel={`${i18n`players`}:`}
            />
          ),
        }}
        sendText={i18n`create`}
        buttons={[
          <Button
            className='lobby__create-back'
            text={i18n`cancel`}
            type='light'
            onClick={() => this.setState({ creating: false, error: '' })}
          />,
        ]}
        onSubmit={this.create}
      />
    </div>
  )

  render() {
    const { connected, creating } = this.state;

    return (
      <div className='lobby'>
        <div className='title'>{i18n`onlineGame`}</div>
        {connected === null && <Loading />}
        {connected === false && (
          <div className='lobby__disconnect'>{i18n`disconnect`}</div>
        )}
        {connected && (creating ? this.renderCreating() : this.renderRooms())}
      </div>
    );
  }
}

export default withRouter(Lobby);
