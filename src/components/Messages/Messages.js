import React, {Component, Fragment} from 'react';
import {Segment, Comment} from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from '../../firebase';
import Message from "./Message";
import {connect} from 'react-redux';
import {setUserPosts} from "../../actions";
import Typing from './Typing';
import Skeleton from "./Skeleton";

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
    isChannelStarred: false,
    typingRef: firebase.database().ref('typing'),
    typingUsers: [],
    connectedRef: firebase.database().ref('.info/connected'),
    listeners: []
  };

  componentDidMount() {
    const {channel, currentUser, listeners} = this.state;

    if (channel && currentUser) {
      this.removeListeners(listeners);
      this.addListeners(channel.id);
      this.addUsersStarsListener(channel.id, currentUser.uid);

    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();

  }

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex(listener => {
      return listener.id === id && listener.ref === ref && listener.event === event
    });

    if (index === -1) {
      const newListeners = {id, ref, event};
      this.setState({listeners: this.state.listeners.concat(newListeners)});
    }
  };

  removeListeners = listeners => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event);
    })
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({behavior: 'smooth'})
  };

  addListeners = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListener(channelId)
  };

  addTypingListener = channelId => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on('child_added', snap => {
      if (snap.key !== this.state.currentUser.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        });
        this.setState({typingUsers});
      }

    });
    this.addToListeners(channelId, this.state.typingRef, 'child_added');

    this.state.typingRef.child(channelId).on('child_removed', snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);

      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({typingUsers})
      }

    })
    this.addToListeners(channelId, this.state.typingRef, 'child_removed');


    this.state.connectedRef.on('value', snap => {
      if (snap.val() === true) {
        this.state.typingRef.child(channelId).child(this.state.currentUser.uid).onDisconnect().remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    });
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
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
    this.addToListeners(channelId, ref, 'child_added');
  };

  addUsersStarsListener = (channelId, currentUserId) => {
    const {usersRef} = this.state;
    usersRef.child(currentUserId).child('starred').once('value').then(data => {
      if (data.val() !== null) {
        const channelIds = Object.keys(data.val());

        const prevStarred = channelIds.includes(channelId);
        this.setState({isChannelStarred: prevStarred})
      }
    })
  };

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        }
      }
      return acc;
    }, {});
    // console.log(userPosts);
    this.props.setUserPosts(userPosts);
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
        if (err !== null) {
          console.error(err);
        }
      })
    }
  };

  displayTypingUsers = users =>
    users.length > 0 && users.map(user => (
      <div style={{display: "flex", alignItems: 'center', marginBottom: '0.2em'}} key={user.id}>
        <span className="user__typing">{user.name} is typing <Typing/></span>
      </div>
    ));

  displayMessagesSkeleton = loading => {
    return loading ? (
      <Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i}/>
        ))}
      </Fragment>
    ) : null
  };

  render() {
    const {messagesRef, channel, currentUser, messages, numUniqueUsers, searchResults, searchTerm, searchLoading, privateChannel, isChannelStarred, typingUsers, messagesLoading} = this.state;
    return (
      <Fragment>
        <MessagesHeader channelName={this.displayChannelName(channel)} numUniqueUsers={numUniqueUsers}
                        handleSearchChange={this.handleSearchChange} searchLoading={searchLoading}
                        isPrivateChannel={privateChannel} handleStar={this.handleStar}
                        isChannelStarred={isChannelStarred}/>
        <Segment className="messages">
          <Comment.Group>
            {this.displayMessagesSkeleton(messagesLoading)}
            {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={node => (this.messagesEnd = node)}></div>
          </Comment.Group>
        </Segment>
        <MessageForm getMessagesRef={this.getMessagesRef} messagesRef={messagesRef} currentChannel={channel}
                     currentUser={currentUser} isPrivateChannel={privateChannel}/>
      </Fragment>
    )
  }
}

export default connect(null, {setUserPosts})(Messages);