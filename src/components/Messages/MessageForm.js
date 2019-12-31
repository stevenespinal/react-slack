import React, {Component} from 'react';
import {Button, Input, Segment} from "semantic-ui-react";
import firebase from "../../firebase";
import FileModal from './FileModal';
import uuidv4 from 'uuid/v4';
import ProgressBar from "./ProgressBar";
import {Picker, emojiIndex} from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css';

class MessageForm extends Component {
  state = {
    message: '',
    loading: false,
    channel: this.props.currentChannel,
    currentUser: this.props.currentUser,
    errors: [],
    modal: false,
    uploadState: '',
    uploadTask: null,
    storageRef: firebase.storage().ref(''),
    percentUploaded: 0,
    typingRef: firebase.database().ref('typing'),
    emojiPicker: false
  };

  handleChange = event => {
    const {name, value} = event.target;
    this.setState({
      [name]: value
    })
  };

  createMessage = (fileUrl = null) => {
    const {message, currentUser} = this.state;
    const newMessage = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: currentUser.uid,
        name: currentUser.displayName,
        avatar: currentUser.photoURL
      }
    };

    if (fileUrl !== null) {
      newMessage["image"] = fileUrl
    } else {
      newMessage["content"] = message;
    }

    return newMessage;
  };

  openModal = () => {
    this.setState({
      modal: true
    })
  };

  closeModal = () => {
    this.setState({
      modal: false
    })
  };

  sendMessage = () => {
    const {getMessagesRef} = this.props;
    const {message, channel, errors, typingRef, currentUser} = this.state;
    if (message) {
      this.setState({
        loading: true
      });
      getMessagesRef().child(channel.id).push().set(this.createMessage()).then(() => {
        this.setState({
          loading: false,
          message: '',
          errors: []
        });
        typingRef.child(channel.id).child(currentUser.uid).remove()
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

  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private=${this.state.channel.id}`
    } else {
      return `chat/public`;
    }
  };

  uploadFile = (file, metadata) => {
    console.log(file, metadata);
    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState({
      uploadState: 'uploading',
      uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
    }, () => {
      this.state.uploadTask.on('state_changed', snap => {
        const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        this.setState({
          percentUploaded
        })
      }, err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err),
          uploadState: 'error',
          uploadTask: null
        })
      }, () => {
        this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
          //  allows us to get the url of the file uploaded to firebase storage
          this.sendFileMessage(downloadUrl, ref, pathToUpload)
        }).catch(err => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            uploadState: 'error',
            uploadTask: null
          })
        });
      });
    })
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref.child(pathToUpload).push().set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({uploadState: 'done'});
      }).catch(err => {
      console.error(err);
      this.setState({
        errors: this.state.errors.concat(err)
      })
    })
  };

  handleKeyUp = () => {
    const {message, typingRef, channel, currentUser} = this.state;
    if (message) {
      typingRef.child(channel.id).child(currentUser.uid).set(currentUser.displayName)
    } else {
      typingRef.child(channel.id).child(currentUser.uid).remove()
    }
  };

  handleTogglePicker = () => {
    this.setState({emojiPicker: !this.state.emojiPicker})
  };


  handleAddEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(`${oldMessage}${emoji.colons} `);
    this.setState({message: newMessage, emojiPicker: false});
    setTimeout(() => {
      this.messageInputRef.focus()
    }, 0)
  };

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };



  render() {
    const {errors, message, loading, modal, percentUploaded, uploadState, emojiPicker} = this.state;
    return (
      <Segment className="message__form">
        {emojiPicker && (
          <Picker
            set="apple"
            className="emojipicker"
            title="Pick your emoji"
            emoji="point_up"
            onSelect={this.handleAddEmoji}
          />
        )}
        <Input fluid name="message" style={{marginBottom: "0.7em"}}
               label={<Button icon={emojiPicker ? "close" : "add"} content={emojiPicker ? "Close" : null} onClick={this.handleTogglePicker}/>} labelPosition="left"
               placeholder="Write your message" onChange={this.handleChange} value={message}
               className={errors.some(err => err.message.includes('message')) ? 'error' : ''}
               onKeyUp={this.handleKeyUp} ref={node => (this.messageInputRef = node)}/>
        <Button.Group icon widths="2">
          <Button color="orange" content="Add Reply" labelPosition="left" icon="edit" onClick={this.sendMessage}
                  disabled={loading}/>
          <Button color="teal" content="Upload Media" labelPosition="right" icon="cloud upload"
                  onClick={this.openModal} disabled={uploadState === "uploading"}/>
        </Button.Group>
        <FileModal modal={modal} closeModal={this.closeModal} uploadFile={this.uploadFile}/>
        <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded}/>
      </Segment>
    )
  }
}

export default MessageForm;