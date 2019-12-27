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
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    usersRef: firebase.database().ref('users'),
    isChannelStarred: false
  };

  componentDidMount() {
    const {channel, currentUser} = this.state;

    if (channel && currentUser) {
      this.addListeners(channel.id);
      this.addUsersStarsListener(channel.id, currentUser.uid);
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      // console.log(loadedMessages);
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
      this.countUniqueUsers(loadedMessages)
    })
  };

  addUsersStarsListener = (channelId, currentUserId) => {
    const {usersRef} = this.state;
    usersRef.child(currentUserId).child('starred').once('value').then(data =>{
      if (data.val() !== null) {
        const channelIds = Object.keys(data.val());

        const prevStarred = channelIds.includes(channelId);
        this.setState({isChannelStarred: prevStarred})
      }
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

  displayChannelName = channel => {
    return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : ''
  };

  handleSearchChange = (event) => {
    this.setState({
      searchTerm: event.target.value,
      searchLoading: true
    }, () => this.handleSearchMessages())
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    //globally & case insensitively
    const regex = new RegExp(this.state.searchTerm, 'gi');
    const searchResults = channelMessages.reduce((acc, message) => {
      if (message.content && (message.content.match(regex) || message.user.name.match(regex))) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({
      searchResults,
    });
    setTimeout(() => {
      this.setState({searchLoading: false})
    }, 1000)
  };

  getMessagesRef = () => {
    const {messagesRef, privateChannel, privateMessagesRef} = this.state;
    return privateChannel ? privateMessagesRef : messagesRef

  };

  handleStar = () => {
    this.setState(prevState => ({
      isChannelStarred: !prevState.isChannelStarred
    }), () => this.starChannel());
  };

  starChannel = () => {
    const {isChannelStarred, usersRef, currentUser, channel} = this.state;
    if (isChannelStarred) {
      console.log('Starred');
      usersRef.child(`${currentUser.uid}/starred`)
        .update({
          [channel.id]: {
            name: channel.name,
            details: channel.details,
            createdBy: {
              name: channel.createdBy.name,
              avatar: channel.createdBy.avatar
            }
          }
        })
    } else {
      console.log('Unstarred');
      usersRef.child(`${currentUser.uid}/starred`).child(channel.id).remove(err => {
        if (err !== null) console.error(err);
      })
    }
  };

  render() {
    const {messagesRef, channel, currentUser, messages, numUniqueUsers, searchResults, searchTerm, searchLoading, privateChannel, isChannelStarred} = this.state;
    return (
      <Fragment>
        <MessagesHeader channelName={this.displayChannelName(channel)} numUniqueUsers={numUniqueUsers}
                        handleSearchChange={this.handleSearchChange} searchLoading={searchLoading}
                        isPrivateChannel={privateChannel} handleStar={this.handleStar}
                        isChannelStarred={isChannelStarred}/>
        <Segment className="messages">
          <Comment.Group>
            {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm getMessagesRef={this.getMessagesRef} messagesRef={messagesRef} currentChannel={channel}
                     currentUser={currentUser} isPrivateChannel={privateChannel}/>
      </Fragment>
    )
  }
}

export default Messages;