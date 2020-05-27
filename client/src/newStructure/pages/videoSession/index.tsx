import * as RTCMultiConnection from 'rtcmulticonnection';
import * as io from 'socket.io-client';

import React from 'react';

import $ from 'jquery';
import { Chat } from './chat';
import { connect } from 'react-redux';
import { copyToClipboard } from './utils';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';
import swal from 'sweetalert';

//@ts-ignore
window.io = io;

const infoDivText = {
  fontSize: 20,
  color: `white`,
  textAlign: `left` as `left`,
};

interface IProps {
  getCurrentUser: any;
  isOpener: any;
  match: any;
  roomId: any;
  user: any;
}

interface IState {
  localConnected: boolean,
  remoteConnected: boolean,
  chatHistory: any,
  roomStatus: any,
  configured: boolean,
}

class VideoSession extends React.Component<IProps, IState> {
  private connection: any;
  private predefinedRoomId: any;

  constructor(props: IProps) {
    super(props);
    this.state = {
      localConnected: false,
      remoteConnected: false,
      chatHistory: [],
      roomStatus: 'Joining room, connecting...',
      configured: false
    };

    this.config = this.config.bind(this);
    this.getRoomId = this.getRoomId.bind(this);
    this.openRoom = this.openRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);

    this.connection = new RTCMultiConnection();
    this.predefinedRoomId = `cradle`;
  }

  getRoomId() {
    if (this.props.roomId) {
      return this.props.roomId;
    } else if (this.props.match.params.roomId) {
      return this.props.match.params.roomId;
    } else {
      return this.predefinedRoomId;
    }
  }

  openRoom() {
    //@ts-ignore
    this.disabled = true;

    let thisRoomId = this.getRoomId();


    this.connection.open(thisRoomId);
  }

  joinRoom() {
    //@ts-ignore
    this.disabled = true;

    let thisRoomId = this.getRoomId();


    this.connection.join(thisRoomId);
  }

  componentDidMount() {

    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser();
    }

    this.config(true);

    let newState = {
      configured: true
    } as { [key: string]: any };


    if (this.props.isOpener) {
      this.openRoom();


      copyToClipboard(
        'https://' + `${window.location.hostname + this.props.match.url}`
      );

      swal(
        'Room Link Copied to Clipboard',
        'Paste and send your room URL to your patient',
        'success'
      );
    } else {
      this.joinRoom();
    }

    if (this.props.isOpener) {
      newState['roomStatus'] =
        'Room created, waiting for remote user to join room...';
    }

    this.setState(newState as IState);
  }

  componentDidUpdate() {
    this.turnOffControls();
  }

  turnOffControls() {
    if ($('video', '#localStream')) {
      $('video', '#localStream').removeAttr('controls');
    } else {
    }
  }

  config(isLocal: any) {
    // this line is VERY_important
    this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

    // all below lines are optional; however recommended.

    this.connection.session = {
      audio: true,
      video: true,
      data: true
    };

    this.connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true
    };

    if (isLocal) {
      this.connection.videosContainer = document.getElementById('localStream');
    } else {
      this.connection.videosContainer = document.getElementById('remoteStream');
    }

    this.connection.onopen = (event: any) => {
      //@ts-ignore
      var remoteUserId = event.userid;
      var remoteUserFullName = event.extra.fullName;

      console.log('data connection opened with ' + remoteUserFullName);

      this.setState({
        roomStatus: 'Connected'
      });
    };

    this.connection.onstream = (event: any) => {
      event.mediaElement.play();
      setTimeout(function() {
        event.mediaElement.play();
      }, 5000);

      var videoContainer;

      // the first time this function is called it is from the local stream,
      // the 2nd time this function is called is because of the remote stream

      if (!this.state.localConnected) {
        videoContainer = document.getElementById('localStream');

        this.setState({
          localConnected: true
        });
      } else {
        videoContainer = document.getElementById('remoteStream');

        this.setState({
          remoteConnected: true
        });
      }

      // @ts-ignore
      videoContainer.appendChild(event.mediaElement);

      event.mediaElement.removeAttribute('controls');

      // @ts-ignore
      window.connection = this.connection;
    };
    
    // @ts-ignore
    window.connection = this.connection;

    // connection.onmessage = function(event) {
    // }

  }

  componentWillUnmount() {

    // disconnect with all users
    this.connection.getAllParticipants().forEach((pid: any) => {
      this.connection.disconnectWith(pid);
    });

    // stop all local cameras
    this.connection.attachStreams.forEach(function(localStream: any) {
      localStream.stop();
    });

    // close socket.io connection
    this.connection.closeSocket();
  }

  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />;
    }


    let roomId = this.getRoomId();


    return (
      <div
        style={{
          height: `calc(100vh - 150px)`,
          width: `100%`,
          backgroundColor: `lightpink`,
          border: `2px solid black`
        }}>
        <div
          style={{
            height: `100%`,
            width: `100%`
          }}>
          <div
            style={{
              width: `100%`,
              height: `100%`,
              display: `flex`,
              flexDirection: `row`
            }}>
            <div
              style={{
                width: `75%`,
                height: `100%`
              }}>
              <div
                style={{
                  paddingLeft: 10,
                  position: `absolute`
                }}>
                <p style={infoDivText}>Stream Id: {roomId}</p>
                <p style={infoDivText}>Status: {this.state.roomStatus}</p>
              </div>
              <div
                id="remoteStream"
                style={{
                  height: `100%`,
                  width: `100%`,
                  backgroundColor: `black`,
                  boxSizing: `border-box`,
                  border: `1px black solid`
                }}></div>
              <div
                id="localStream"
                style={{
                  height: 200,
                  width: 300,
                  position: `relative`,
                  bottom: 225,
                  right: `calc(-100% + 300px + 25px)`,
                  backgroundColor: `black`,
                  borderRadius: 15,
                  border: `1px white solid`
                }}></div>
            </div>
            <Chat connection={this.connection} isOpener={this.props.isOpener} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ chat, user }: any) => ({
  isOpener: chat.isOpener,
  roomId: chat.roomId,
  user: user.currentUser,
});

const mapDispatchToProps = (dispatch: any) => ({
  getCurrentUser: () => {
    dispatch(getCurrentUser());
  },
});

export const VideoSessionPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoSession);
