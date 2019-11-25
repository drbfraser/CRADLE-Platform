import React, { Component } from 'react';
import "./videoChatLanding.css";
import 'typeface-roboto';

import { Button, Header } from 'semantic-ui-react'
import TextField from '@material-ui/core/TextField'

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

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleRoomIdChange = this.handleRoomIdChange.bind(this);
    this.toggleCreateForm = this.toggleCreateForm.bind(this);
    this.toggleEnterForm = this.toggleEnterForm.bind(this);
    this.sendLoginInfo = this.sendLoginInfo.bind(this);
  }

  sendLoginInfo() {
    // this.props.updateLogin(this.state.name, this.state.roomId, this.state.isOpener);
  }

  handleNameChange(name) {
    this.setState({name: name});
  }

  handleRoomIdChange(id) {
    this.setState({roomId: id})
  }

  toggleCreateForm() {
    this.setState((state) => ({
      createFormOpen: !state.createFormOpen,
      enterFormOpen: false,
      roomId: cryptoRandomString(6),
      isOpener: true
    }));
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
       
        <Button className="createRoom" onClick={this.toggleCreateForm} style={{marginRight: '15px', backgroundColor: styles.createRoom}}>
          Create Room
        </Button>

        <Button className="enterRoom" onClick={this.toggleEnterForm} style={{backgroundColor: styles.enterRoom}}>
          Join Existing Room
        </Button>  

        {this.state.createFormOpen &&
          <Form 
            roomId={this.state.roomId}
            onNameChange={this.handleNameChange}
            onRoomIdChange={this.handleRoomIdChange}
            onSubmit={this.sendLoginInfo}
          />
        }
        
        {this.state.enterFormOpen &&
          <Form 
            roomId={""}
            onNameChange={this.handleNameChange}
            onRoomIdChange={this.handleRoomIdChange}
            onSubmit={this.sendLoginInfo}
          />
        }
      </div>
      </div>
    );
  }
}

class Form extends Component {
  constructor(props) {
    super(props);

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleRoomIdChange = this.handleRoomIdChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNameChange(e) {
    // this.props.onNameChange(e.target.value);
  }

  handleRoomIdChange(e) {
    // this.props.onRoomIdChange(e.target.value);
  }

  handleSubmit(e) {
    // this.props.onSubmit();
  }

  render() {
    let roomIdInput;
    // if (this.props.roomId) {
    //   roomIdInput = <input type="text" value={this.props.roomId} disabled/>
    // } else {
      roomIdInput = <input type="text" onChange={this.handleRoomIdChange} placeholder="Enter room ID..." />
    // }

    return (
      <div className="loginFormWrapper">
        <form>
          <label>
            Name:<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <input type="text" onChange={this.handleNameChange} placeholder="Enter name..." />
          </label>
          <br /> 
          <br />                
          <label>
            Room ID:<span>&nbsp;</span>
            {roomIdInput}
          </label>
          <br />
          <br />
          <Button variant="contained" onClick={this.handleSubmit}>
            Enter
          </Button>
        </form>
      </div>
    );
  }
}

export default VideoLanding;
