import * as RTCMultiConnection from 'rtcmulticonnection';
import * as io from 'socket.io-client';

import React from 'react';

import { Chat } from './chat';
import { connect } from 'react-redux';
import classes from './styles.module.scss';
import { useSetup } from './hooks';

//@ts-ignore
window.io = io;

interface IProps {
  getCurrentUser: any;
  isOpener: any;
  match: any;
  roomId: any;
  user: any;
}

interface IState {
  localConnected: boolean;
  remoteConnected: boolean;
  chatHistory: any;
  roomStatus: any;
  configured: boolean;
}

export const Component: React.FC<IProps> = props => {
  const connection = React.useRef<typeof RTCMultiConnection>(
    new RTCMultiConnection()
  );
  const predefinedRoomId = React.useRef<string>(`cradle`);
  const [state, setState] = React.useState<IState>({
    localConnected: false,
    remoteConnected: false,
    chatHistory: [],
    roomStatus: 'Joining room, connecting...',
    configured: false
  });

  const getRoomId = (): string => {
    if (props.roomId) {
      return props.roomId;
    } else if (props.match.params.roomId) {
      return props.match.params.roomId;
    }

    return predefinedRoomId.current;
  };

  const openRoom = (): void => connection.current.open(getRoomId());

  const joinRoom = (): void => connection.current.join(getRoomId());

  useSetup({
    configArgs: {
      connection: connection.current,
      isLocal: true,
      localConnected: state.localConnected,
      onConnected: (): void =>
        setState(
          (currentState: IState): IState => ({
            ...currentState,
            roomStatus: `Connected`
          })
        ),
      onLocalConnected: (): void =>
        setState(
          (currentState: IState): IState => ({
            ...currentState,
            localConnected: true
          })
        ),
      onRemoteConnected: (): void =>
        setState(
          (currentState: IState): IState => ({
            ...currentState,
            remoteConnected: true
          })
        )
    },
    isOpener: props.isOpener,
    url: `https://${window.location.hostname}${props.match.url}`,
    joinRoom,
    openRoom,
    onRoomCreated: (): void =>
      setState(
        (currentState: IState): IState => ({
          ...currentState,
          configured: true,
          roomStatus: props.isOpener
            ? `Room created, waiting for remote user to join room...`
            : currentState.roomStatus
        })
      )
  });

  return (
    <div className={classes.container}>
      <div className={classes.row}>
        <div className={classes.info}>
          <div className={classes.header}>
            <p className={classes.text}>Stream Id: {getRoomId()}</p>
            <p className={classes.text}>Status: {state.roomStatus}</p>
          </div>
          <div id="remoteStream" className={classes.remoteStream}></div>
          <div id="localStream" className={classes.localStream}></div>
        </div>
        <Chat connection={connection.current} isOpener={props.isOpener} />
      </div>
    </div>
  );
};

const mapStateToProps = ({ chat, user }: any) => ({
  isOpener: chat.isOpener,
  roomId: chat.roomId,
  user: user.currentUser
});

export const VideoSessionPage = connect(mapStateToProps)(Component);
