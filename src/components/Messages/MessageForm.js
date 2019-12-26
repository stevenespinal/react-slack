import React, {Component} from 'react';
import {Button, Input, Segment} from "semantic-ui-react";
import firebase from "../../firebase";
import FileModal from './FileModal';
import uuidv4 from 'uuid/v4';
import ProgressBar from "./ProgressBar";

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
    percentUploaded: 0
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

  uploadFile = (file, metadata) => {
    console.log(file, metadata);
    const pathToUpload = this.state.channel.id;
    const ref = this.props.messagesRef;
    const filePath = `chat/public/${uuidv4()}.jpg`;

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

  render() {
    const {errors, message, loading, modal, percentUploaded, uploadState} = this.state;
    return (
      <Segment className="message__form">
        <Input fluid name="message" style={{marginBottom: "0.7em"}} label={<Button icon="add"/>} labelPosition="left"
               placeholder="Write your message" onChange={this.handleChange} value={message}
               className={errors.some(err => err.message.includes('message')) ? 'error' : ''}/>
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