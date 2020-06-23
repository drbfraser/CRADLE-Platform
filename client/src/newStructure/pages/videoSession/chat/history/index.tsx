import React from 'react';
import classes from './styles.module.css';

interface IProps {
  chatHistory: any;
}

export const ChatHistory: React.FC<IProps> = (props) => (
  <div id="chatHistory" className={classes.container}>
    {props.chatHistory.map((msg: any, index: number) => (
      <div className={classes.messageContainer} key={index}>
        {msg.sender === `opener` ? (
          <img
            alt="doctor.png"
            src="/images/doctor.png"
            className={classes.chatAvatar}
          />
        ) : (
          <img
            alt="girl-doctor"
            src="/images/girl-doctor.png"
            className={classes.chatAvatar}
          />
        )}
        <div className={classes.text}>
          <span className={classes.bold}>{msg.senderName}</span>
          <span>{msg.text}</span>
        </div>
      </div>
    ))}
  </div>
);
