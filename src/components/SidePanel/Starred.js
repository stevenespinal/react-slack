import React, {Component} from 'react';
import {Icon, Menu} from "semantic-ui-react";
import {connect} from 'react-redux';
import {setPrivateChannel, setCurrentChannel} from "../../actions";
import firebase from "../../firebase";

class Starred extends Component {
  state = {
    activeChannel: "",
    starredChannels: [],
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users")
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }


  addListeners = userId => {
    const {usersRef} = this.state;
    usersRef.child(userId).child("starred").on("child_added", snap => {
      const starredChannel = {id: snap.key, ...snap.val()};
      this.setState({
        starredChannels: [...this.state.starredChannels, starredChannel]
      });
    });

    usersRef.child(userId).child("starred").on("child_removed", snap => {
      const channelToRemove = {id: snap.key, ...snap.val()};
      const filteredChannels = this.state.starredChannels.filter(channel => {
        return channel.id !== channelToRemove.id
      });

      this.setState({starredChannels: filteredChannels});
    })
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  setActiveChannel = (channel) => {
    this.setState({activeChannel: channel.id});
  };

  displayChannels = starredChannels =>
    starredChannels.length > 0 && starredChannels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{opacity: 0.7}}
        active={channel.id === this.state.activeChannel}
      >
        # {channel.name}
      </Menu.Item>
    )
    );

  render() {
    const {starredChannels} = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star"/> STARRED </span> ({starredChannels.length})
        </Menu.Item>
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    )
  }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Starred);