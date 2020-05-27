import React from 'react';

const chatAvatar = {
  height: 50,
  marginLeft: 10,
  width: 50,
  border: `1px solid`,
  borderRadius: 10,
};

export const ChatHistory: React.FC<any> = (props) => (
  <div
    id="chatHistory"
    style={{
      height: `calc(100% - 95px)`,
      overflowY: `scroll`,
      borderBottom: `2px solid black`,
    }}>
    {props.chatHistory.map((msg: any) => {
      return (
        <div
          style={{
            display: `flex`,
            marginBlockStart: 5,
            paddingBlockEnd: 5,
            borderBottomStyle: `solid`,
            borderWidth: 1,
            borderColor: `black`,
          }}>
          {msg.sender == `opener` ? (
            <img src="/images/doctor.png" style={chatAvatar} />
          ) : (
            <img src="/images/girl-doctor.png" style={chatAvatar} />
          )}
          <div
            style={{
              display: `flex`,
              flexDirection: `column`,
              margin: `0 10px`,
            }}>
            <span style={{ fontWeight: `bold` }}>{msg.senderName}</span>
            <span>{msg.text}</span>
          </div>
        </div>
      );
    })}
  </div>
);
