// @ts-nocheck

import * as RTCMultiConnection from 'rtcmulticonnection';
import * as io from 'socket.io-client';

import React, { Component } from 'react';

import $ from 'jquery';
import { Chat } from './chat';
import { ReduxState } from '../../redux/rootReducer';
import classes from './styles.module.css';
import { connect } from 'react-redux';
import swal from 'sweetalert';

window.io = io;

const connection = new RTCMultiConnection();

const predefinedRoomId = 'cradle';

class Session extends Component {
  state = {
    localConnected: false,
    remoteConnected: false,
    chatHistory: [],
    roomStatus: 'Joining room, connecting...',
    configured: false,
  };

  getRoomId = () => {
    if (this.props.roomId) {
      return this.props.roomId;
    } else if (this.props.match.params.roomId) {
      return this.props.match.params.roomId;
    } else {
      return predefinedRoomId;
    }
  };

  openRoom = () => {
    this.disabled = true;

    const thisRoomId = this.getRoomId();

    connection.open(thisRoomId);
  };

  joinRoom = () => {
    this.disabled = true;

    const thisRoomId = this.getRoomId();

    connection.join(thisRoomId);
  };

  componentDidMount = () => {
    this.config(true);

    const newState = {
      configured: true,
    };

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

    this.setState(newState);
  };

  componentDidUpdate = () => this.turnOffControls();

  turnOffControls = () => {
    if ($('video', '#localStream')) {
      $('video', '#localStream').removeAttr('controls');
    }
  };

  config = (isLocal) => {
    // this line is VERY_important
    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

    // all below lines are optional; however recommended.

    connection.session = {
      audio: true,
      video: true,
      data: true,
    };

    connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true,
    };

    if (isLocal) {
      connection.videosContainer = document.getElementById('localStream');
    } else {
      connection.videosContainer = document.getElementById('remoteStream');
    }

    connection.onopen = function (): void {
      // const remoteUserId = event.userid;
      // const remoteUserFullName = event.extra.fullName;

      this.setState({
        roomStatus: 'Connected',
      });
    }.bind(this);

    connection.onstream = function (event) {
      event.mediaElement.play();
      setTimeout(function () {
        event.mediaElement.play();
      }, 5000);

      let videoContainer;

      // the first time this function is called it is from the local stream,
      // the 2nd time this function is called is because of the remote stream

      if (!this.state.localConnected) {
        videoContainer = document.getElementById('localStream');

        this.setState({
          localConnected: true,
        });
      } else {
        videoContainer = document.getElementById('remoteStream');

        this.setState({
          remoteConnected: true,
        });
      }

      videoContainer.appendChild(event.mediaElement);

      event.mediaElement.removeAttribute('controls');

      window.connection = connection;
    }.bind(this);

    window.connection = connection;

    // connection.onmessage = function(event) {
    // }
  };

  componentWillUnmount = () => {
    // disconnect with all users
    connection.getAllParticipants().forEach(function (pid) {
      connection.disconnectWith(pid);
    });

    // stop all local cameras
    connection.attachStreams.forEach(function (localStream) {
      localStream.stop();
    });

    // close socket.io connection
    connection.closeSocket();
  };

  render() {
    return (
      <div className={classes.container}>
        <div className={classes.content}>
          <div className={classes.row}>
            <div className={classes.info}>
              <div className={classes.header}>
                <p>Stream Id: {this.getRoomId()}</p>
                <p>Status: {this.state.roomStatus}</p>
              </div>
              <div className={classes.remoteStream} id="remoteStream"></div>
              <div className={classes.localStream} id="localStream"></div>
            </div>
            <Chat connection={connection} isOpener={this.props.isOpener} />
          </div>
        </div>
      </div>
    );
  }
}

const copyToClipboard = (str) => {
  const el = document.createElement('textarea'); // Create a <textarea> element
  el.value = str; // Set its value to the string that you want copied
  el.setAttribute('readonly', ''); // Make it readonly to be tamper-proof
  el.style.position = 'absolute';
  el.style.left = '-9999px'; // Move outside the screen to make it invisible
  document.body.appendChild(el); // Append the <textarea> element to the HTML document
  const selected =
    document.getSelection().rangeCount > 0 // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0) // Store selection if found
      : false; // Mark as false to know no selection existed before
  el.select(); // Select the <textarea> content
  document.execCommand('copy'); // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el); // Remove the <textarea> element
  if (selected) {
    // If a selection existed before copying
    document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
    document.getSelection().addRange(selected); // Restore the original selection
  }
};

const mapStateToProps = ({ chat }: ReduxState) => ({ ...chat });

export const VideoSessionPage = connect(mapStateToProps, null)(Session);
