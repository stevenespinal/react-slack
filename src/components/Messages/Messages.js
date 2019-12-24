import React, {Component, Fragment} from 'react';
import {Segment, Comment} from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from '../../firebase';

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    currentUser: this.props.currentUser
  };
  render() {
    const {messagesRef, channel, currentUser} = this.state;
    return (
      <Fragment>
        <MessagesHeader/>
        <Segment>
          <Comment.Group className="messages">

          </Comment.Group>
        </Segment>
        <MessageForm messagesRef={messagesRef} currentChannel={channel} currentUser={currentUser}/>
      </Fragment>
    )
  }
}

export default Messages;