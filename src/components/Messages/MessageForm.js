import React, {Component} from 'react';
import {Button, Input, Segment} from "semantic-ui-react";
import firebase from "../../firebase";

class MessageForm extends Component {
  state = {
    message: '',
    loading: false,
    channel: this.props.currentChannel,
    currentUser: this.props.currentUser,
    errors: []
  };

  handleChange = event => {
    const {name, value} = event.target;
    this.setState({
      [name]: value
    })
  };

  createMessage = () => {
    const {message, currentUser} = this.state;
    return {
      content: message,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: currentUser.uid,
        name: currentUser.displayName,
        avatar: currentUser.photoURL
      }
    }
  };

  sendMessage = () => {
    const {messagesRef} = this.props;
    const {message, channel, errors} = this.state;
    if (message) {
      this.setState({
        loading: true
      });
      messagesRef.child(channel.id).push().set(this.createMessage()).then(() => {
        this.setState({
          loading: false,
          message: '',
          errors: []
        })
      }).catch(error => {
        console.error(error);
        this.setState({
          loading: false,
          errors: errors.concat(error)
        })
      })
    } else {
      this.setState({
        errors: errors.concat({message: 'Add a message'})
      })
    }
  };

  render() {
    const {errors, message} = this.state;
    return (
      <Segment className="message__form">
        <Input fluid name="message" style={{marginBottom: "0.7em"}} label={<Button icon="add"/>} labelPosition="left"
               placeholder="Write your message" onChange={this.handleChange} value={message}
               className={errors.some(err => err.message.includes('message')) ? 'error' : ''}/>
        <Button.Group icon widths="2">
          <Button color="orange" content="Add Reply" labelPosition="left" icon="edit" onClick={this.sendMessage}/>
          <Button color="teal" content="Upload Media" labelPosition="right" icon="cloud upload"/>
        </Button.Group>
      </Segment>
    )
  }
}

export default MessageForm;