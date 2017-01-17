import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';


import { SourceFile } from '../File/';
import { MimeTypes } from '../EditorPane/';
import { Confirm, Abort } from './Buttons';

const getSeed = (type) => {
  if (type === 'application/json') {
    return '{}';
  }
  return '\n'.repeat(30);
};

export default class AddDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    reject: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired
  };

  state = {
    mimeTypes: Object.keys(MimeTypes),
    type: '',
    name: '',
  };

  handleAdd = () => {
    const { name, type } = this.state;

    this.props.resolve(
      new SourceFile({
        name,
        type,
        text: getSeed(type)
      })
    );

    this.props.onRequestClose();
  };

  handleUpdateType = (type) => {
    this.setState({ type });
  };

  handleUpdateName = (event, name) => {
    this.setState({ name });
  };

  cancel = () => {
    this.props.reject();
    this.props.onRequestClose();
  };

  render() {
    const {
      localization,
    } = this.props;

    const actions = [
      <Abort label={localization.addDialog.cancel} onTouchTap={this.cancel} />,
      <Confirm label={localization.addDialog.add} onTouchTap={this.handleAdd} />
    ];

    return (
      <Dialog
        title={localization.addDialog.title}
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={this.cancel}
      >
        <AutoComplete fullWidth
          searchText={this.state.type}
          floatingLabelText={localization.addDialog.mimeType}
          hintText="text/javascript"
          dataSource={this.state.mimeTypes}
          onUpdateInput={this.handleUpdateType}
          onNewRequest={this.handleUpdateType}
        />
        <TextField fullWidth
          value={this.state.name}
          floatingLabelText={localization.addDialog.fileName}
          hintText="main.js"
          onChange={this.handleUpdateName}
        />
      </Dialog>
    );
  }
}
