import React, { Component, PropTypes } from 'react';
import { Dialog, FlatButton, RaisedButton, TextField } from 'material-ui';


export default class SignDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any
  };

  handleSign = () => {
    const { resolve, onRequestClose } = this.props;
    const name = this.name.input.value;
    const url = this.url.input.value;

    resolve({ name, url });
    onRequestClose();
  };

  render() {
    const { open, onRequestClose, content } = this.props;

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={onRequestClose}
      />,
      <RaisedButton
        label="OK"
        primary={true}
        onTouchTap={this.handleSign}
      />
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
          ref={(input) => this.name = input}
          floatingLabelText={`Who made the ${content.name}?`}
          hintText="e.g. Javascript Lover"
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
