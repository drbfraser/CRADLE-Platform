import './videoChatLanding.css';
import 'typeface-roboto';

import { Button, Header } from 'semantic-ui-react';
import { createRoom, joinRoom } from './reducers/chat';

import { CustomForm } from './customForm';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCurrentUser } from '../../shared/reducers/user/currentUser';

class VideoChatComponent extends React.Component {
  constructor(props) {
    super(props);
    // initial state here:
    this.state = {
      roomId: null,
      isOpener: false,
      name: null,
      createFormOpen: false,
      enterFormOpen: false,
    };

    this.handleRoomIdChange = this.handleRoomIdChange.bind(this);
    this.createNewRoom = this.createNewRoom.bind(this);
    this.toggleEnterForm = this.toggleEnterForm.bind(this);
    this.joinExistingRoom = this.joinExistingRoom.bind(this);
  }

  joinExistingRoom() {
    console.log('this.state.roomId: ', this.state.roomId);
    this.props.joinRoom(this.state.roomId);
  }

  handleRoomIdChange(id) {
    this.setState({ roomId: id });
  }

  createNewRoom() {
    let randomString = Math.random()
      .toString(13)
      .replace('0.', '')
      .substring(0, 6);
    console.log('creating new room: ', randomString);
    this.props.createRoom(randomString);
  }

  toggleEnterForm() {
    this.setState((state) => ({
      enterFormOpen: !state.enterFormOpen,
      createFormOpen: false,
      roomId: null,
      isOpener: false,
    }));
  }

  componentDidMount() {
    console.log('in component did mount');

    if (!this.props.user.isLoggedIn) {
      this.props.getCurrentUser();
    }
  }

  // after the user has logged in or created the room, set the appropriate state variables and then render the Session Component and pass in these state variables as props
  render() {
    // don't render page if user is not logged in
    if (!this.props.user.isLoggedIn) {
      return <div />;
    }

    const styles = {
      createRoom: null,
      enterRoom: null,
    };

    if (this.state.createFormOpen) {
      styles.createRoom = '#ababad';
      styles.enterRoom = null;
    } else if (this.state.enterFormOpen) {
      styles.enterRoom = '#ababad';
      styles.createRoom = null;
    }

    return (
      <div className="loginOverlay">
        <div className="loginContainer">
          <Header as={'h1'}>CradleChat</Header>

          <Button
            className="createRoom"
            onClick={this.createNewRoom}
            style={{ marginRight: '15px', backgroundColor: styles.createRoom }}>
            Create Room
          </Button>

          <Button
            className="enterRoom"
            onClick={this.toggleEnterForm}
            style={{ backgroundColor: styles.enterRoom }}>
            Join Existing Room
          </Button>

          {this.state.enterFormOpen && (
            <CustomForm
              roomId={''}
              onRoomIdChange={this.handleRoomIdChange}
              onSubmit={this.joinExistingRoom}
            />
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ chat, user }) => ({
  isOpener: chat.isOpener,
  roomId: chat.roomId,
  user: user.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  getCurrentUser: () => dispatch(getCurrentUser()),
  ...bindActionCreators(
    {
      createRoom,
      joinRoom,
    },
    dispatch
  ),
});

export const VideoChatPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoChatComponent);
