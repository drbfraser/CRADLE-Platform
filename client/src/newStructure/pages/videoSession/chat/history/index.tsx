import React from 'react';
import classes from './styles.module.css';

interface IProps {
  chatHistory: any;
}

export const ChatHistory: React.FC<IProps> = props => (
  <div id="chatHistory" className={classes.container}>
    {props.chatHistory.map((msg: any) => (
      <div
        style={{
          display: `flex`,
          marginBlockStart: 5,
          paddingBlockEnd: 5,
          borderBottomStyle: `solid`,
          borderWidth: 1,
          borderColor: `black`
        }}>
        {msg.sender == `opener` ? (
          <img src="/images/doctor.png" className={classes.chatAvatar} />
        ) : (
          <img src="/images/girl-doctor.png" className={classes.chatAvatar} />
        )}
        <div
          style={{
            display: `flex`,
            flexDirection: `column`,
            margin: `0 10px`
          }}>
          <span style={{ fontWeight: `bold` }}>{msg.senderName}</span>
          <span>{msg.text}</span>
        </div>
      </div>
    ))}
  </div>
);
