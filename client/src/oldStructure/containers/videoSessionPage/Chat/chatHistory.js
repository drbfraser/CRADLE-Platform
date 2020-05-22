import React, { Component } from 'react'

export default function(props) {
  return (
    <div className="chatHistory" id="chatHistory">
      {props.chatHistory.map(msg => {
        return (
          <ChatMessage
            msg={msg}
            sender={msg.sender}
            senderName={msg.senderName}
          />
        )
      })}
    </div>
  )
}

function ChatMessage(props) {
  console.log('props: ', props)

  return (
    <div className="chatMessage">
      {props.sender == 'opener' ? (
        <img className="chatAvatar" src="/images/doctor.png"></img>
      ) : (
        <img className="chatAvatar" src="/images/girl-doctor.png"></img>
      )}
      <div className="chatContent">
        <span className="messageUserName">{props.senderName}</span>
        <span>{props.msg.text}</span>
      </div>
    </div>
  )
}
