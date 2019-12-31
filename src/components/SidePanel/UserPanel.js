import React, {Component} from 'react';
import {Grid, Header, Icon, Dropdown, Image, Modal, Input, Button} from "semantic-ui-react";
import firebase from '../../firebase';
import AvatarEditor from "react-avatar-editor";


class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: '',
    croppedImage: '',
    blob: '',
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    metadata: {
      contentType: 'image/jpeg'
    },
    uploadedCroppedImage: ''
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

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        })
      });
    }
  };


  handleChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        this.setState({previewImage: reader.result})
      })
    }
  };

  uploadCroppedImage = () => {
   const {storageRef, userRef, blob, metadata} = this.state;
   storageRef.child(`avatars/user-${userRef.uid}`)
     .put(blob, metadata)
     .then(snap => {
       snap.ref.getDownloadURL().then(downloadURL => {
         this.setState({
           uploadedCroppedImage: downloadURL
         }, () => {
           this.changeAvatar()
         });
       });
     });
  };

  changeAvatar = () => {

  };

  render() {
    const {user, modal, previewImage, croppedImage} = this.state;
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
              <Input fluid type="file" label="New Avatar" name="previewImage" onChange={this.handleChange}/>
              <Grid stackable centered columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && <AvatarEditor ref={node => (this.avatarEditor = node)} image={previewImage} width={120} height={120} border={50} scale={1.2}/>}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && <Image style={{margin: '3.5em auto'}} width={100} height={100} src={croppedImage}/>}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (<Button color="green" inverted onClick={this.uploadCroppedImage}>
                <Icon name="save"/> Change Avatar
              </Button>)}
              <Button color="green" inverted onClick={this.handleCropImage}>
                <Icon name="image"/> Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove"/> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    )
  }
}


export default UserPanel;