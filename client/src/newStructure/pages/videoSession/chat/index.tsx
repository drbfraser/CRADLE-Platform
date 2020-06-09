import { OrNull, User } from '@types';

import $ from 'jquery';
import Button from '@material-ui/core/Button';
import { ChatHistory } from './history';
import Input from '@material-ui/core/Input';
import React from 'react';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import classes from './styles.module.css';
import { connect } from 'react-redux';

interface IProps {
  connection: any;
  isOpener: boolean;
  user: OrNull<User>;
}

interface IState {
  chatHistory: Array<any>;
  pendingInput: string;
}

class Component extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      chatHistory: [], // array of message objects
      pendingInput: ``,
    };

    this.props.connection.onmessage = this.appendRemoteMessage;
  }

  appendRemoteMessage = (event: any): void => {
    console.log(event);
    let sender = this.getSender(true);

    this.setState(
      {
        pendingInput: ``,
        chatHistory: this.state.chatHistory.concat({
          senderName: event.data.senderName,
          sender: sender,
          text: event.data.msg,
        }),
      },
      () => {
        // scroll to the bottom of chat
        $('#chatHistory').scrollTop(
          $('#chatHistory')[0].scrollHeight - $('#chatHistory')[0].clientHeight
        );
      }
    );
  };

  handleSubmit = (): void => {
    let data = {
      msg: this.state.pendingInput,
      senderName: this.props.user?.firstName,
    };

    this.props.connection.send(data);

    let sender = this.getSender();

    this.setState(
      {
        pendingInput: '',
        chatHistory: this.state.chatHistory.concat({
          senderName: this.props.user?.firstName,
          sender: sender,
          text: this.state.pendingInput,
        }),
      },
      function () {
        // scroll to the bottom of chat
        $('#chatHistory').scrollTop(
          $('#chatHistory')[0].scrollHeight - $('#chatHistory')[0].clientHeight
        );
      }
    );
  };

  handleChange = (event: any): void =>
    this.setState({
      pendingInput: event.target.value,
    });

  handleKeyDown = (event: any): void => {
    // User presses enter
    if (event.keyCode == 13) {
      this.handleSubmit();
    }
  };

  getSender = (isRemote?: boolean): string => {
    if (isRemote) {
      if (this.props.isOpener) {
        return `joiner`;
      } else {
        return `opener`;
      }
    } else {
      if (this.props.isOpener) {
        return `opener`;
      } else {
        return `joiner`;
      }
    }
  };

  render() {
    return (
      <div className={classes.container}>
        <ChatHistory chatHistory={this.state.chatHistory} />
        <div className={classes.wrapper}>
          <Button size="small" color="primary" className={classes.button}>
            Send
          </Button>
          <form className={classes.form} id="chatForm">
            <Input
              className={classes.input}
              id="outlined-multiline-static"
              multiline
              rows="4"
              placeholder="Send a message..."
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
              value={this.state.pendingInput}
            />
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ user }: ReduxState) => ({
  user: user.current.data,
});

export const Chat = connect(mapStateToProps, null)(Component);
