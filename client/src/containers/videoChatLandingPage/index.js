import React, { Component } from 'react';
import "./videoChatLanding.css";
import 'typeface-roboto';

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Button, Header, Form } from 'semantic-ui-react'

import { createRoom, joinRoom } from '../../actions/chat';

const cryptoRandomString = require('crypto-random-string');

class VideoLanding extends Component {
  constructor(props) {
    super(props);
    // initial state here:
    this.state = {
      roomId: null,
      isOpener: false,
      name: null,
      createFormOpen: false,
      enterFormOpen: false
    }

    this.handleRoomIdChange = this.handleRoomIdChange.bind(this);
    this.createNewRoom = this.createNewRoom.bind(this);
    this.toggleEnterForm = this.toggleEnterForm.bind(this);
    this.joinExistingRoom = this.joinExistingRoom.bind(this);
  }

  joinExistingRoom() {
      console.log("this.state.roomId: ", this.state.roomId);
    this.props.joinRoom(this.state.roomId)
  }

  handleRoomIdChange(id) {
    this.setState({roomId: id})
  }

  createNewRoom() {
      let randomString = Math.random().toString(13).replace('0.', '').substring(0,6);
      console.log("creating new room: ", randomString);
      this.props.createRoom(randomString)
  }

  toggleEnterForm() {
    this.setState((state) => ({
      enterFormOpen: !state.enterFormOpen,
      createFormOpen: false,
      roomId: null,
      isOpener: false
    }))
  }

  // after the user has logged in or created the room, set the appropriate state variables and then render the Session Component and pass in these state variables as props 
  render() {

    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />
    }

    const styles = {
      createRoom: null,
      enterRoom: null
    }

    if(this.state.createFormOpen) {
      styles.createRoom = "#ababad"
      styles.enterRoom = null      
    } else if(this.state.enterFormOpen){
      styles.enterRoom = "#ababad"
      styles.createRoom = null      
    }
    
    return (
      <div className="loginOverlay">
        <div className="loginContainer">
        <Header as={"h1"} >
          CradleChat
        </Header>
       
        <Button className="createRoom" onClick={this.createNewRoom} style={{marginRight: '15px', backgroundColor: styles.createRoom}}>
          Create Room
        </Button>

        <Button className="enterRoom" onClick={this.toggleEnterForm} style={{backgroundColor: styles.enterRoom}}>
          Join Existing Room
        </Button>
        
        {this.state.enterFormOpen &&
          <CustomForm 
            roomId={""}
            onRoomIdChange={this.handleRoomIdChange}
            onSubmit={this.joinExistingRoom}
          />
        }
      </div>
      </div>
    );
  }
}

class CustomForm extends Component {
  constructor(props) {
    super(props);

    this.handleRoomIdChange = this.handleRoomIdChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleRoomIdChange(e) {
    this.props.onRoomIdChange(e.target.value);
  }

  handleSubmit(e) {
    this.props.onSubmit();
  }

  render() {
    let roomIdInput;
    roomIdInput = <input type="text" onChange={this.handleRoomIdChange} placeholder="Enter room ID..." />

    return (
      <div className="loginFormWrapper">
        <Form>
          <label>
            Room ID:<span>&nbsp;</span>
            {roomIdInput}
          </label>
          <br />
          <br />
          <Button variant="contained" onClick={this.handleSubmit}>
            Enter
          </Button>
        </Form>
      </div>
    );
  }
}


const mapStateToProps = ({ chat, user }) => ({
    isOpener: chat.isOpener,
    roomId: chat.roomId,
    user : user.currentUser
})
  
const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            createRoom,
            joinRoom
        },
            dispatch
    )

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VideoLanding)

