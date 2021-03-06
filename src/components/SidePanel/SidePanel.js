import React, {Component} from 'react';
import {Menu} from "semantic-ui-react";
import UserPanel from './UserPanel';
import Channels from './Channels';
import DirectMessages from './DirectMessages';
import Starred from "./Starred.js";

class SidePanel extends Component {
  render() {
    const {currentUser, primary} = this.props;
    return (
      <Menu size="large" inverted fixed="left" vertical style={{background: primary, fontSize:"1.2rem"}} className="scrollbars">
        <UserPanel currentUser={currentUser} primary={primary}/>
        <Starred currentUser={currentUser}/>
        <Channels currentUser={currentUser}/>
        <DirectMessages currentUser={currentUser}/>
      </Menu>
    )
  }
}

export default SidePanel;