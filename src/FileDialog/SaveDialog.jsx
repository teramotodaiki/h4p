import React, { PropTypes, Component } from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Save from 'material-ui/svg-icons/content/save';


import { Confirm, Abort } from './Buttons';
import FilenameInput from './FilenameInput';

export default class SaveDialog extends Component {

  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any
  };

  state = {
    fallbackHref: null
  };

  isFallback = (typeof document.createElement('a').download === 'undefined');
  componentDidMount() {
    if (this.isFallback) {
      this.setFallbackHref();
    }
  }

  get blob() {
    const { content: { type, isText, blob, text } } = this.props;
    return isText ? new Blob([text], { type }) : blob;
  }

  handleSave = () => {
    const { content, onRequestClose } = this.props;
    // download
    var event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    const elem = document.createElement('a');
    elem.download = this.input.value;
    elem.href = URL.createObjectURL(this.blob);
    elem.dispatchEvent(event);

    onRequestClose();
  };

  setFallbackHref = () => {
    const { content } = this.props;
    const reader = new FileReader();
    reader.onload = (e) => this.setState({ fallbackHref: reader.result });
    reader.readAsDataURL(this.blob);
  };

  render() {
    const { open, content, onRequestClose } = this.props;
    const { fallbackHref } = this.state;

    const actions = [
      <Abort onTouchTap={onRequestClose} />,
      <Confirm
        label="Save"
        onTouchTap={this.handleSave}
        disabled={this.isFallback}
      />
    ];

    if (this.isFallback) {
      actions.push(
        <RaisedButton
          label="Right click to download"
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
        open={true}
        onRequestClose={onRequestClose}
      >
        <FilenameInput
          ref={(input) => this.input = input}
          defaultName={content.name}
          defaultType={content.type}
          disabled={this.isFallback}
        />
      </Dialog>
    );
  }
}
