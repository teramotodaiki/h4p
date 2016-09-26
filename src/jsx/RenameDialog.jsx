import React, { Component, PropTypes } from 'react';
import { Dialog, FlatButton, TextField } from 'material-ui';

export default class RenameDialog extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    updateFilename: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    file: PropTypes.object
  };

  state = {
    filename: this.props.file && this.props.file.filename
  };

  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.file) {
      this.setState({ filename: nextProps.file.filename })
    }
  }

  handleRename = (event) => {
    const { filename } = this.state;
    const { updateFilename, onRequestClose } = this.props;
    updateFilename(filename);
    onRequestClose();
  }

  handleChange = (event) => {
    const filename = event.target.value;
    this.setState({ filename });
  }

  render() {
    const { open, file, onRequestClose } = this.props;
    const { filename } = this.state;

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={onRequestClose}
      />,
      <FlatButton
        label="Rename"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleRename}
        disabled={false}
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
        <TextField
          value={filename}
          onChange={this.handleChange}
        />
      </Dialog>
    );
  }
}
