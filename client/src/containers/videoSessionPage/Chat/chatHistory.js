import React, { Component } from 'react';

export default function (props) {
    return (
        <div className="chatHistory" id="chatHistory">
            { props.chatHistory.map((msg) => {
                return(<ChatMessage msg={msg} sender={msg.sender}/>)
            })}
        </div>
    )
}

function ChatMessage(props) {

    console.log("props: ", props);

    return (
        <div className="chatMessage">
            {props.sender == "opener" ? (
                <img className="chatAvatar" src="/images/cropped-doctor.png"></img>
            ) : (
                <img className="chatAvatar" src="/images/cropped-user.jpg"></img>
            )}
            <div>{props.msg.text}</div>
        </div>
    )
}