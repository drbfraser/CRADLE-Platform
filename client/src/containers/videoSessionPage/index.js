import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import RTCMultiConnection from 'rtcmulticonnection';
import $ from "jquery";
import swal from 'sweetalert';
import Chat from './Chat';

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import './session.css'

var connection = new RTCMultiConnection();

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
}); 


var predefinedRoomId = 'cradle';

class Session extends Component {

  constructor(props) {
    super(props);
    this.state = {
      localConnected: false,
      remoteConnected: false,
      chatHistory: [],
      roomStatus: "Waiting for remote user to join room...",
      configured: false
    }

    this.config = this.config.bind(this);
    this.getRoomId = this.getRoomId.bind(this);
    this.openRoom = this.openRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
  }

  getRoomId() {
    if(this.props.roomId) {
      return this.props.roomId
    } else {
      return predefinedRoomId
    }
  }

  openRoom() {
    this.disabled = true;

    let thisRoomId = this.getRoomId();
    
    console.log("opening room with id: ", thisRoomId);

    connection.open( thisRoomId );
    
  }

  joinRoom() {
    this.disabled = true;

    let thisRoomId = this.getRoomId();
    
    console.log("joining room with id: ", thisRoomId);

    connection.join( thisRoomId ); 
  }

  componentDidMount() {
    this.config(true);

    this.setState({
      configured: true
    })

    console.log("isOpener: ", this.props.isOpener);
    console.log("roomId: ", this.getRoomId());

    if(this.props.isOpener) {
      this.openRoom();

      console.log("url: ", this.props.match.url);

      copyToClipboard("https://" + `${window.location.hostname + this.props.match.url}`);

      swal("Room Link Copied to Clipboard", "Paste and send your room URL to your patient", "success");

    } else {

      this.joinRoom();


    }
  }

  componentDidUpdate() {
    this.turnOffControls()
  }

  turnOffControls() {
    if($("video", "#localStream")) {
      $("video", "#localStream").removeAttr('controls');
      console.log("removed")
    } else {
      console.log("blah");
    }  
  }

  config(isLocal) {
    // this line is VERY_important
    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
  
    // all below lines are optional; however recommended.
  
    connection.session = {
        audio: true,
        video: true,
        data: true
    };
  
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };
  
    if(isLocal) {  
      connection.videosContainer = document.getElementById('localStream');
    } else {
      connection.videosContainer = document.getElementById('remoteStream');
    }
  
    connection.onopen = function(event) {
      var remoteUserId = event.userid;
      var remoteUserFullName = event.extra.fullName;
  
      console.log('data connection opened with ' + remoteUserFullName);

      this.setState({
        roomStatus: "Connected"
      })
    }.bind(this);
  
    connection.onstream = function(event) {
  
      console.log("state: ", this.state);
  
      console.log("isRoomJoined: ", connection.isRoomJoined);
  
      console.log("isLocal: ", isLocal);
  
      event.mediaElement.play();
      setTimeout(function () {
        event.mediaElement.play();
      }, 5000);
  
      var videoContainer;

      // the first time this function is called it is from the local stream,
      // the 2nd time this function is called is because of the remote stream


      if(!this.state.localConnected) {
        videoContainer = document.getElementById('localStream');
      
        this.setState({
          localConnected: true
        })

      } else {
        videoContainer = document.getElementById('remoteStream');
     
        this.setState({
          remoteConnected: true
        })

      }
  
      videoContainer.appendChild( event.mediaElement );
  
      event.mediaElement.removeAttribute('controls')
  
      window.connection = connection;
  
    }.bind(this)
  

    window.connection = connection;

    // connection.onmessage = function(event) {
    //   console.log("received a message: ", event.data);
    // }

    this.connection = connection;
  }
  
  
  render() {
    const { classes } = this.props

    console.log("this.props.isOpener: ", this.props.isOpener);

    let roomId = this.getRoomId();

    return (
      <div className="session">

        <div className="session-ui">

          <div className="topSection">
              <div className="streamContainer">
                  <div className="infoDiv">
                    <p>Stream Id: {roomId}</p>
                    <p>Status: {this.state.roomStatus}</p>
                  </div>
                  <div className="remoteStream" id="remoteStream">
                  </div>
                  <div className="localStream" id="localStream">
                  </div>  
              </div>
              <Chat connection={connection} isOpener={this.props.isOpener}/>
          </div>  
        </div>
      </div>
    );
  }
}

const copyToClipboard = str => {
  const el = document.createElement('textarea');  // Create a <textarea> element
  el.value = str;                                 // Set its value to the string that you want copied
  el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  el.style.position = 'absolute';                 
  el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  const selected =            
    document.getSelection().rangeCount > 0        // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0)     // Store selection if found
      : false;                                    // Mark as false to know no selection existed before
  el.select();                                    // Select the <textarea> content
  document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);                  // Remove the <textarea> element
  if (selected) {                                 // If a selection existed before copying
    document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
    document.getSelection().addRange(selected);   // Restore the original selection
  }
};

const mapStateToProps = ({ chat }) => ({
    isOpener: chat.isOpener,
    roomId: chat.roomId
})

export default connect(
    mapStateToProps,
    null
)(Session)
