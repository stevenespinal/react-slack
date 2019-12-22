import React, {Component, Fragment} from 'react';
import {Menu, Icon, Modal, Form, Input, Button} from "semantic-ui-react";
import firebase from '../../firebase';

class Channels extends Component {
  state = {
    channels: [],
    modal: false,
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref('channels'),
    user: this.props.currentUser
  };

  componentDidMount() {
    this.addListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    const {channelsRef} = this.state;
    channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      // console.log(loadedChannels);
      this.setState({
        channels: loadedChannels
      })
    });
  };

  closeModal = () => {
    this.setState({
      modal: false
    })
  };

  openModal = () => {
    this.setState({
      modal: true
    })
  };

  addChannel = () => {
    const {channelsRef, channelName, channelDetails, user} = this.state;
    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    channelsRef.child(key).update(newChannel).then(() => {
      this.setState({
        channelName: "",
        channelDetails: ""
      });
      this.closeModal();
      console.log("channel added")
    }).catch(error => console.error(error));
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  isFormValid = ({channelName, channelDetails}) => channelName && channelDetails;


  handleChange = (event) => {
    const {name, value} = event.target;
    this.setState({
      [name]: value
    })
  };

  displayChannels = channels => (
    channels.length > 0 && channels.map(channel => {
      return (
        <Menu.Item key={channel.id} onClick={() => console.log(channel)} name={channel.name} style={{opacity: 0.7}}>
          # {channel.name}
        </Menu.Item>
      )
    })
  );

  render() {
    const {channels, modal} = this.state;
    return (
      <Fragment>
        <Menu.Menu style={{paddingBottom: "2em"}}>
          <Menu.Item>
          <span>
            <Icon name="exchange"/> CHANNELS </span>
            ({channels.length}) <Icon name="add" className="plus-sign" onClick={this.openModal}/>
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input fluid label="Name of Channel" name="channelName" onChange={this.handleChange}/>
              </Form.Field>
              <Form.Field>
                <Input fluid label="About the Channel" name="channelDetails" onChange={this.handleChange}/>
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark"/>Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove"/>Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Fragment>
    )
  }
}

export default Channels;