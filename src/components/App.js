import React from 'react';
import {Grid} from "semantic-ui-react";
import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";
import {connect} from 'react-redux';
import './App.css';


const App = ({currentUser, currentChannel, isPrivateChannel, userPosts, primary, secondary}) => (
  <Grid columns="equal" className="App" style={{background: secondary}}>
    <ColorPanel currentUser={currentUser} key={currentUser && currentUser.name} primary={primary} secondary={secondary}/>
    <SidePanel key={currentUser && currentUser.uid} currentUser={currentUser} primary={primary}/>

    <Grid.Column style={{marginLeft: 320}}>
      <Messages key={currentChannel && currentChannel.name} currentChannel={currentChannel} currentUser={currentUser} isPrivateChannel={isPrivateChannel}/>
    </Grid.Column>

    <Grid.Column width={4}>
      <MetaPanel isPrivateChannel={isPrivateChannel} key={currentChannel && currentChannel.name} currentChannel={currentChannel} userPosts={userPosts}/>
    </Grid.Column>
  </Grid>
);

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.posts,
  primary: state.colors.primary,
  secondary: state.colors.secondary
});

export default connect(mapStateToProps)(App);
