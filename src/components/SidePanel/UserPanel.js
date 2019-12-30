import React, {Component} from 'react';
import {Grid, Header, Icon, Dropdown, Image, Modal, Input, Button} from "semantic-ui-react";
import firebase from '../../firebase';


class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    modal: false
  };

  openModal = () => {
    this.setState({modal: true})
  };

  closeModal = () => {
    this.setState({modal: false})
  };

  dropdownOptions = () => [
    {
      key: "user",
      text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
      disabled: true
    },
    {
      key: "avatar",
      text: <span onClick={this.openModal}>Change Avatar</span>
    },
    {
      key: "signout",
      text: <span onClick={this.handleSignOut} className="signout">Sign Out</span>
    },
  ];

  handleSignOut = () => {
    firebase.auth().signOut().then(() => {
      console.log("Signed Out")
    })
  };

  render() {
    const {user, modal} = this.state;
    const {primary} = this.props;
    return (
      <Grid style={{background: primary}}>
        <Grid.Column>
          <Grid.Row style={{padding: "1.2em", margin: 0}}>
            <Header inverted floated="left" as="h2">
              <Icon name="code"/>
              <Header.Content>Dev Chat</Header.Content>
            </Header>
            <Header style={{padding: "0.25em", marginTop: "3em"}} as="h3" inverted>
              <Dropdown trigger={
                <span>
                <Image src={user.photoURL} spaced="right" avatar/>
                  {user.displayName}
              </span>
              } options={this.dropdownOptions()}/>
            </Header>
          </Grid.Row>
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input fluid type="file" label="New Avatar" name="previewImage"/>
              <Grid stackable centered columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">

                  </Grid.Column>
                  <Grid.Column>

                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              <Button color="green" inverted>
                <Icon name="save"/> Change Avatar
              </Button>
              <Button color="green" inverted>
                <Icon name="image"/> Preview
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    )
  }
}


export default UserPanel;