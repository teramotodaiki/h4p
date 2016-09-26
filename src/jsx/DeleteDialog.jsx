import React, { Component, PropTypes } from 'react';
import { Dialog, FlatButton, TextField } from 'material-ui';

export default class DeleteDialog extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    deleteFile: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    file: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  handleDelete = () => {
    const { file, deleteFile, onRequestClose } = this.props;
    deleteFile(file);
    onRequestClose();
  }

  render() {
    const { open, file, onRequestClose } = this.props;
    const filename = file && file.filename;

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={onRequestClose}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleDelete}
        disabled={false}
      />
    ];

    return (
      <Dialog
        title={`Do you really want to delete ${filename} ?`}
        actions={actions}
        modal={false}
        open={open}
        onRequestClose={onRequestClose}
      >
        <div>This operation can not be undone.</div>
      </Dialog>
    );
  }
}
