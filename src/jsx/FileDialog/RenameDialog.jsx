import React, { Component, PropTypes } from 'react';
import { Dialog, FlatButton, RaisedButton } from 'material-ui';


import FilenameInput from './FilenameInput';

export default class RenameDialog extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    updateFile: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any
  };

  handleRename = (event) => {
    const { content, updateFile, onRequestClose } = this.props;
    const name = this.input.name;
    const filename = this.input.value;
    updateFile(content, { name, filename });
    onRequestClose();
  }

  render() {
    const { open, content, onRequestClose } = this.props;

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={onRequestClose}
      />,
      <RaisedButton
        label="Rename"
        primary={true}
        onTouchTap={this.handleRename}
      />
    ];

    return (
      <Dialog
        title="Enter the new filename for the file"
        actions={actions}
        modal={false}
        open={open}
        onRequestClose={onRequestClose}
      >
        <FilenameInput
          ref={(input) => this.input = input}
          defaultName={content.name}
        />
      </Dialog>
    );
  }
}
