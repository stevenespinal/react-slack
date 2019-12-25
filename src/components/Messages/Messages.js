import React, {Component, Fragment} from 'react';
import {Segment, Comment} from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from '../../firebase';
import Message from "./Message";

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    currentUser: this.props.currentUser,
    messages: [],
    messagesLoading: true
  };

  componentDidMount() {
    const {channel, currentUser} = this.state;

    if (channel && currentUser) {
      this.addListeners(channel.id)
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId)
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    const {messagesRef} = this.state;
    messagesRef.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      // console.log(loadedMessages);
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      })
    })
  };

  displayMessages = messages => (
    messages.length > 0 && messages.map(msg => (
      <Message key={msg.timestamp} message={msg} user={this.state.currentUser}/>
    ))
  );

  render() {
    const {messagesRef, channel, currentUser, messages} = this.state;
    return (
      <Fragment>
        <MessagesHeader/>
        <Segment className="messages">
          <Comment.Group>
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm messagesRef={messagesRef} currentChannel={channel} currentUser={currentUser}/>
      </Fragment>
    )
  }
}

export default Messages;