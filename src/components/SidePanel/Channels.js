import React, {Component, Fragment} from 'react';
import {Menu, Icon, Modal, Form, Input, Button} from "semantic-ui-react";
import firebase from '../../firebase';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from "../../actions";

class Channels extends Component {
  state = {
    activeChannel: '',
    channels: [],
    channel: null,
    modal: false,
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    messagesRef: firebase.database().ref("messages"),
    notifications: [],
    user: this.props.currentUser,
    firstLoad: true,
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    const {channelsRef} = this.state;
    // stops listening & will unsubscribe itself from channels ref
    channelsRef.off();
  };

  addListeners = () => {
    let loadedChannels = [];
    const {channelsRef} = this.state;
    channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      this.setState({channels: loadedChannels}, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = channelId => {
    const {messagesRef, channel, notifications} = this.state;
    messagesRef.child(channelId).on('value', snap => {
      if (channel) {
        this.handleNotifications(channelId, channel.id, notifications, snap)
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    //any notification in a given channel
    let index = notifications.findIndex(notification => notification.id === channelId);
    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }

    this.setState({notifications});
  };

  setFirstChannel = () => {
    const {firstLoad, channels} = this.state;
    const {setCurrentChannel} = this.props;
    const firstChannel = channels[0];

    if (firstLoad && channels.length > 0) {
      setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({channel: firstChannel})
    }
    this.setState({
      firstLoad: false
    })
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
        <Menu.Item key={channel.id} onClick={() => this.changeChannel(channel)} name={channel.name}
                   style={{opacity: 0.7}} active={channel.id === this.state.activeChannel}>
          <span className="channels"># {channel.name}</span>
        </Menu.Item>
      )
    })
  );

  changeChannel = channel => {
    this.props.setCurrentChannel(channel);
    this.setActiveChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({channel});
  };

  setActiveChannel = (channel) => {
    this.setState({activeChannel: channel.id});
  };

  render() {
    const {channels, modal} = this.state;
    return (
      <Fragment>
        <Menu.Menu className="menu">
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

export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels);