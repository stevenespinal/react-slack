import React, {Component} from 'react';
import {Icon, Menu} from "semantic-ui-react";
import {connect} from 'react-redux';
import {setPrivateChannel, setCurrentChannel} from "../../actions";

class Starred extends Component {
  state = {
    activeChannel: '',
    starredChannels: []
  };

  changeChannel = channel => {
    this.props.setCurrentChannel(channel);
    this.setActiveChannel(channel);
    this.props.setPrivateChannel(false);
  };

  setActiveChannel = (channel) => {
    this.setState({activeChannel: channel.id});
  };

  displayChannels = starredChannels => (
    starredChannels.length > 0 && starredChannels.map(channel => {
      return (
        <Menu.Item key={channel.id} onClick={() => this.changeChannel(channel)} name={channel.name}
                   style={{opacity: 0.7}} active={channel.id === this.state.activeChannel}>
          <span className="starredChannels"># {channel.name}</span>
        </Menu.Item>
      )
    })
  );

  render() {
    const {starredChannels} = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star"/> CHANNELS </span> ({starredChannels.length})
        </Menu.Item>
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    )
  }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Starred);