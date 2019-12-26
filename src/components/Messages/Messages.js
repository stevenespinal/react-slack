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
    messagesLoading: true,
    numUniqueUsers: ''
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
      });
      this.countUniqueUsers(loadedMessages)
    })
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name)
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} User${plural ? 's' : ''}`;
    this.setState({
      numUniqueUsers
    })
  };

  displayMessages = messages => (
    messages.length > 0 && messages.map(msg => (
      <Message key={msg.timestamp} message={msg} user={this.state.currentUser}/>
    ))
  );

  displayChannelName = channel => channel ? `#${channel.name}`: '';

  render() {
    const {messagesRef, channel, currentUser, messages, numUniqueUsers} = this.state;
    return (
      <Fragment>
        <MessagesHeader channelName={this.displayChannelName(channel)} numUniqueUsers={numUniqueUsers}/>
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