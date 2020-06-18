import 'typeface-roboto';

import { Button, Header } from 'semantic-ui-react';
import { createRoom, joinRoom } from './reducers/chat';

import { CustomForm } from './customForm';
import React from 'react';
import { bindActionCreators } from 'redux';
import classes from './styles.module.css';
import { connect } from 'react-redux';

interface IProps {
  createRoom: any;
  joinRoom: any;
}

interface IState {
  roomId: any;
  isOpener: any;
  name: any;
  createFormOpen: any;
  enterFormOpen: any;
}

const Page: React.FC<IProps> = ({ createRoom, joinRoom }) => {
  const [state, setState] = React.useState<IState>({
    roomId: null,
    isOpener: false,
    name: null,
    createFormOpen: false,
    enterFormOpen: false,
  });

  const joinExistingRoom = (): void => joinRoom(state.roomId);

  const handleRoomIdChange = (id: any): void =>
    setState(
      (currentState: IState): IState => ({ ...currentState, roomId: id })
    );

  const createNewRoom = (): void => {
    const randomString = Math.random()
      .toString(13)
      .replace('0.', '')
      .substring(0, 6);
    createRoom(randomString);
  };

  const toggleEnterForm = (): void =>
    setState(
      (currentState: IState): IState => ({
        ...currentState,
        enterFormOpen: !currentState.enterFormOpen,
        createFormOpen: false,
        roomId: null,
        isOpener: false,
      })
    );

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <Header as="h1">CradleChat</Header>
        <Button
          className={
            state.createFormOpen ? classes.createRoom : classes.createRoomHidden
          }
          onClick={createNewRoom}>
          Create Room
        </Button>
        <Button
          className={
            !state.createFormOpen && state.enterFormOpen
              ? classes.enterRoom
              : classes.enterRoomHidden
          }
          onClick={toggleEnterForm}>
          Join Existing Room
        </Button>
        {state.enterFormOpen && (
          <CustomForm
            onRoomIdChange={handleRoomIdChange}
            onSubmit={joinExistingRoom}
          />
        )}
      </div>
    </div>
  );
};

const mapStateToProps = ({ chat }: any) => ({
  isOpener: chat.isOpener,
  roomId: chat.roomId,
});

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      createRoom,
      joinRoom,
    },
    dispatch
  );

export const VideoChatPage = connect(mapStateToProps, mapDispatchToProps)(Page);
