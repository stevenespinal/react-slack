import React, {Component} from 'react';
import mime from 'mime-types';
import {Modal, Input, Button, Icon} from "semantic-ui-react";


class FileModal extends Component {
  state = {
    file: null,
    authorized: ['image/jpeg', "image/png"]
  };

  addFile = event => {
    const {files} = event.target;
    console.log(files[0]);

    if (files[0]) {
      this.setState({
        file: files[0]
      })
    }
  };

  isAuthorized = filename => {
    return this.state.authorized.includes(mime.lookup(filename));
  };

  sendFile = () => {
    const {file} = this.state;
    const {uploadFile, closeModal} = this.props;

    if (file !== null) {
      if (this.isAuthorized(file.name)) {
      //  send file here
        const metadata = {contentType: mime.lookup(file.name)};
        uploadFile(file, metadata);
        closeModal();
        this.clearFile();
      }
    }
  };

  clearFile = () => this.setState({file: null});

  render() {
    const {modal, closeModal} = this.props;
    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input onChange={this.addFile} fluid label="File types: JPG/PNG" name="file" type="file"/>
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" inverted onClick={this.sendFile}><Icon name="checkmark"/>Send</Button>
          <Button color="red" inverted onClick={closeModal}><Icon name="remove"/>Cancel</Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

export default FileModal