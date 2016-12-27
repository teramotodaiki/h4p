import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

import { Confirm, Abort } from './Buttons';

export default class SignDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any
  };

  handleSign = () => {
    const { resolve, onRequestClose } = this.props;
    const label = this.label.input.value;
    const url = this.url.input.value;

    resolve({ label, url });
    onRequestClose();
  };

  render() {
    const { open, onRequestClose, content } = this.props;

    const actions = [
      <Abort onTouchTap={onRequestClose} />,
      <Confirm label="OK" onTouchTap={this.handleSign} />
    ];

    return (
      <Dialog
        title="Signature"
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={onRequestClose}
      >
        <TextField id=""
          ref={(input) => this.label = input}
          floatingLabelText={`Who made the file "${content.name}"?`}
          hintText="e.g. (c) 2017 Teramoto Daiki"
          fullWidth={true}
        />
        <TextField id=""
          ref={(input) => this.url = input}
          floatingLabelText={`Website URL`}
          hintText="e.g. https://github.com/teramotodaiki/h4p (optional)"
          fullWidth={true}
        />
      </Dialog>
    );
  }
}
