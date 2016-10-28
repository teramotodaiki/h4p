import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';


import { Confirm, Abort } from './Buttons';
import FilenameInput from './FilenameInput';

export default class RenameDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any
  };

  handleRename = (event) => {
    const { onRequestClose, resolve } = this.props;
    const { name, type } = this.input;
    resolve({ name, type });
    onRequestClose();
  }

  render() {
    const { onRequestClose, content } = this.props;

    const actions = [
      <Abort onTouchTap={onRequestClose} />,
      <Confirm label="Rename" onTouchTap={this.handleRename} />
    ];

    return (
      <Dialog
        title="Enter the new filename for the file"
        actions={actions}
        modal={false}
        open={true}
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
