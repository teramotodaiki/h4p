import React, {PropTypes, Component} from 'react';
import {Dialog, FlatButton, TextField, RaisedButton} from 'material-ui';
import Save from 'material-ui/svg-icons/content/save';

export default class SaveDialog extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any
  };

  state = {
    value: null,
    fallbackHref: null
  };

  constructor(props) {
    super(props);

    this.isFallback = (typeof document.createElement('a').download === 'undefined');
  }

  get blob() {
    const { content } = this.props;
    return new Blob([content.text]);
  }

  handleChange = (event) => {
    const value = event.target.value;
    this.setState({ value });
  };

  handleSave = () => {
    const { content, onRequestClose } = this.props;
    // download
    var event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    const elem = document.createElement('a');
    elem.download = this.state.value || content.placeholder;
    elem.href = URL.createObjectURL(this.blob);
    elem.dispatchEvent(event);

    this.handleClose();
  };

  handleClose = () => {
    this.setState({ value: null, fallbackHref: null });
    this.props.onRequestClose();
  };

  setFallbackHref = () => {
    const { content } = this.props;
    const reader = new FileReader();
    reader.onload = (e) => this.setState({ fallbackHref: reader.result });
    reader.readAsDataURL(this.blob);
  };

  render() {
    const { open, content, onRequestClose } = this.props;
    const { value, fallbackHref } = this.state;

    const filename = value !== null ? value : content && content.placeholder;
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Save"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleSave}
        disabled={this.isFallback}
      />
    ];

    if (this.isFallback) {
      actions.push(
        <RaisedButton
          label="Right click to download"
          ref={this.setFallbackHref}
          href={fallbackHref}
          icon={<Save />}
          primary={true}
        />
      );
    }

    return (
      <Dialog
        title="Save as"
        actions={actions}
        modal={false}
        open={open}
        onRequestClose={this.handleClose}
      >
        <TextField
          value={filename}
          onChange={this.handleChange}
          disabled={this.isFallback}
        />
      </Dialog>
    );
  }
}
