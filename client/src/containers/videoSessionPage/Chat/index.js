import React, {
    Component
} from 'react';
import Input from '@material-ui/core/Input';
import './chat.css'
import ChatHistory from './chatHistory.js'

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// import Fab from '@material-ui/core/Fab';
// import AddIcon from '@material-ui/icons/Add';

import $ from "jquery"

const styles = theme => ({
    button: {
      margin: theme.spacing.unit,
    },
    input: {
      display: 'none',
    },
  });

class Chat extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chatHistory: [], // array of message objects
            pendingInput: ""
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.getSender = this.getSender.bind(this);

        this.props.connection.onmessage = this.appendRemoteMessage.bind(this);

    }

    appendRemoteMessage(event) {

        console.log("appending remote message")

        let sender = this.getSender(true);

        console.log("event.data: ", event.data);

        this.setState({
            pendingInput: "",
            chatHistory: this.state.chatHistory.concat({
                senderName: event.data.senderName,
                sender: sender,
                text: event.data.msg
            })
        }, function () {
            // scroll to the bottom of chat
            $('#chatHistory').scrollTop($('#chatHistory')[0].scrollHeight - $('#chatHistory')[0].clientHeight);
        })
    }

    handleSubmit(event) {
        console.log("submitting input: ", this.state.pendingInput);

        let data = {
            "msg": this.state.pendingInput,
            "senderName": this.props.user.firstName
        }

        this.props.connection.send(data);

        let sender = this.getSender();

        this.setState({
            pendingInput: "",
            chatHistory: this.state.chatHistory.concat({
                senderName: this.props.user.firstName,
                sender: sender,
                text: this.state.pendingInput
            })
        }, function () {
            // scroll to the bottom of chat
            $('#chatHistory').scrollTop($('#chatHistory')[0].scrollHeight - $('#chatHistory')[0].clientHeight);
        })
    }

    handleChange(event) {
        console.log("handling change")
        console.log("event.target.value: ", event.target.value);


        this.setState({
            pendingInput: event.target.value
        })
    }

    handleKeyDown(event) {
        console.log("keyed down");
        console.log(event.keyCode);
        // user presses enter
        if (event.keyCode == 13) {
            this.handleSubmit(event);
        }
    }

    getSender(isRemote) {
        
        if(isRemote) {
            if(this.props.isOpener) {
                return "joiner"
            } else {
                return "opener"
            }
        } else {
            if(this.props.isOpener) {
                return "opener" 
            } else {
                return "joiner"
            }
        }
        
    }

  render() {

    const { classes } = this.props;

    const name = this.props.user.firstName;

    return(
        <div className="chatContainer">
            {/* <ChatInfo name={name}/> */}
            <ChatHistory chatHistory={this.state.chatHistory} />
            <div className="chatInput">
                <Button size="small" color="primary" className={classes.button + " chatSubmitButton"}>
                    Send
                </Button>

                {/* <Fab size="small" color="secondary" aria-label="Add" className={classes.margin} style={
                    {"height":"25px","width":"25px","maxHeight":"25px","minHeight":"25px","position":"absolute","left":"calc(75% + 10px)","top":"calc(75% + 20px - 95px)"}
                }>
                    <AddIcon />
                </Fab> */}
                <form className="chatForm" id="chatForm" style={{paddingRight: "35px"}}>
                    <Input
                        id="outlined-multiline-static"
                        multiline
                        rows="4"
                        placeholder="Send a message..."
                        margin="normal"
                        variant="outlined"
                        style={{
                            width: "100%",
                            margin: '0'
                        }}
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyDown}
                        value={this.state.pendingInput}
                    />
                </form>
            
            </div>
        </div>
    )
    
  }
}

const mapStateToProps = ({ user }) => ({
    user : user.currentUser
})

export default connect(
    mapStateToProps,
    null
)(withStyles(styles)(Chat));

function ChatInfo(props) {
    return (
        <div className="chatInfoContainer">
            <span className="chatInfoName">
                {props.name}
            </span>
        </div>
    )
}
