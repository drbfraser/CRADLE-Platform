import $ from 'jquery';
import Button from '@material-ui/core/Button';
import { ChatHistory } from './history';
import Input from '@material-ui/core/Input';
import React from 'react';
import { connect } from 'react-redux';
import classes from './styles.module.css';

interface IProps {
  connection: any;
  isOpener: any;
  classes?: any;
  user?: any;
}

interface IState {
  chatHistory: any;
  pendingInput: any;
}

const Component: React.FC<IProps> = props => {
  const [state, setState] = React.useState<IState>({
    chatHistory: [], // array of message objects
    pendingInput: ''
  });

  React.useEffect((): void => {
    props.connection.onmessage = appendRemoteMessage;
  }, [props.connection]);

  React.useEffect((): void => {
    $('#chatHistory').scrollTop(
      $('#chatHistory')[0].scrollHeight - $('#chatHistory')[0].clientHeight
    );
  }, [state]);

  const getSender = (isRemote?: any): string => {
    if (isRemote) {
      if (props.isOpener) {
        return `joiner`;
      } else {
        return `opener`;
      }
    } else {
      if (props.isOpener) {
        return `opener`;
      } else {
        return `joiner`;
      }
    }
  };

  const appendRemoteMessage = (event: any): void =>
    setState({
      pendingInput: '',
      chatHistory: state.chatHistory.concat({
        senderName: event.data.senderName,
        sender: getSender(true),
        text: event.data.msg
      })
    });

  const handleSubmit = (): void => {
    let data = {
      msg: state.pendingInput,
      senderName: props.user.firstName
    };

    props.connection.send(data);

    setState({
      pendingInput: '',
      chatHistory: state.chatHistory.concat({
        senderName: props.user.firstName,
        sender: getSender(),
        text: state.pendingInput
      })
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void =>
    setState(
      (currentState: IState): IState => ({
        ...currentState,
        pendingInput: event.target.value
      })
    );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.keyCode == 13) {
      handleSubmit();
    }
  };

  return (
    <div className={classes.container}>
      <ChatHistory chatHistory={state.chatHistory} />
      <div className={classes.wrapper}>
        <Button
          size="small"
          color="primary"
          className={classes.button}
        >
          Send
        </Button>
        <form id="chatForm" className={classes.form}>
          <Input
            id="outlined-multiline-static"
            className={classes.input}
            multiline
            rows="4"
            placeholder="Send a message..."
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={state.pendingInput}
          />
        </form>
      </div>
    </div>
  );
};

const mapStateToProps = ({ user }: any) => ({
  user: user.currentUser
});

export const Chat = connect(mapStateToProps)(Component);
