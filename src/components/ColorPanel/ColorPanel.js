import React, {Component, Fragment} from 'react';
import {Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment} from "semantic-ui-react";
import {SliderPicker} from 'react-color';
import firebase from '../../firebase';

class ColorPanel extends Component {
  state = {
    modal: false,
    primary: '',
    secondary: '',
    usersRef: firebase.database().ref('users'),
    user: this.props.currentUser,
    userColors: []
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid);
    }
  }

  addListener = (userId) => {
    let userColors = [];
    this.state.usersRef.child(`${userId}/colors`).on("child_added", snap => {
      userColors.unshift(snap.val());
      console.log(userColors);
      this.setState({userColors})
    });
  };

  openModal = () => {
    this.setState({modal: true})
  };

  closeModal = () => {
    this.setState({modal: false})
  };

  handleChangePrimary = color => this.setState({primary: color.hex});

  handleChangeSecondary = color => this.setState({secondary: color.hex});

  handleSaveColors = () => {
    const {primary, secondary} = this.state;
    if (primary && secondary) {
      this.saveColors(this.state.primary, this.state.secondary);
    }
  };

  saveColors = (primary, secondary) => {
    this.state.usersRef.child(`${this.state.user.uid}/colors`)
      .push()
      .update({
        primary, secondary
      })
      .then(() => {
        console.log('Colors added');
        this.closeModal()
      })
      .catch((err) => {
        console.error(err);
      })
  };

  displayUserColors = colors => {
   return colors.length > 0 && colors.map((color, i) => (
      <Fragment key={i}>
        <Divider/>
        <div className="color__container">
          <div className="color__square" style={{background: color.primary}}>
            <div className="color__overlay" style={{background: color.secondary}}></div>
          </div>
        </div>
      </Fragment>
    ))
  };

  render() {
    const {modal, primary, secondary, userColors} = this.state;
    return (
      <Sidebar as={Menu} icon="labeled" inverted visible vertical width="very thin">
        <Divider/>
        <Button icon="add" size="small" color="blue" onClick={this.openModal}/>
        {this.displayUserColors(userColors)}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content="Primary Color"/>
              <SliderPicker color={primary} onChange={this.handleChangePrimary}/>
            </Segment>

            <Segment inverted>
              <Label content="Secondary Color"/>
              <SliderPicker color={secondary} onChange={this.handleChangeSecondary}/>
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark"/>Save Colors
            </Button>
            <Button color="red" inverted  onClick={this.closeModal}><Icon name="remove"/>Cancel</Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    )
  }
}

export default ColorPanel;