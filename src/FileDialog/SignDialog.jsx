import React, { PureComponent, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';

import { Confirm, Abort } from './Buttons';

export default class SignDialog extends PureComponent {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]).isRequired,
    getFiles: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  state = {
    files: [].concat(this.props.content),
    completeLabels: [],
    completeUrls: [],
  };

  _completeLabels = new Set();
  _completeUrls = new Set();

  componentWillMount() {
    for (const file of this.props.getFiles()) {
      for (const item of file.credits) {
        this._completeLabels.add(item.label);
        this._completeUrls.add(item.url);
      }
      if (file.sign) {
        this._completeLabels.add(file.sign.label);
        this._completeUrls.add(file.sign.url);
      }
    }

    if (this._completeLabels.size > 0) {
      this.setState({
        completeLabels: [...this._completeLabels],
      });
    }
    if (this._completeUrls.size > 0) {
      this.setState({
        completeUrls: [...this._completeUrls],
      });
    }
  }

  handleUpdate = (file, sign) => {
    if (file.sign === sign) return;

    this.setState({
      files: this.state.files
        .map((item) => item === file ? item.set({ sign }) : item),
    });
  };

  handleComplete = (sign) => {
    if (!sign) return;

    if (sign.label) {
      this._completeLabels.add(sign.label);
      this.setState({
        completeLabels: [...this._completeLabels],
      });
    }
    if (sign.url) {
      this._completeUrls.add(sign.url);
      this.setState({
        completeUrls: [...this._completeUrls],
      });
    }
  };

  handleSign = () => {
    if (this.props.content instanceof Array) {
      this.props.resolve(this.state.files);
    } else {
      this.props.resolve(this.state.files[0]);
    }
    this.props.onRequestClose();
  };

  cancel = () => {
    this.props.resolve(this.props.content);
    this.props.onRequestClose();
  };

  render() {
    const {
      content,
      localization,
    } = this.props;

    const actions = [
      <Abort onTouchTap={this.cancel} />,
      <Confirm
        label="OK"
        onTouchTap={this.handleSign}
      />
    ];

    return (
      <Dialog
        title="Signature"
        actions={actions}
        modal={false}
        open={true}
        bodyStyle={{ overflow: 'scroll' }}
        onRequestClose={this.cancel}
      >
      {this.state.files.map((item) => (
        <SignItem
          key={item.key}
          file={item}
          completeLabels={this.state.completeLabels}
          completeUrls={this.state.completeUrls}
          localization={this.props.localization}
          onUpdate={this.handleUpdate}
          onComplete={this.handleComplete}
        />
      ))}
      </Dialog>
    );
  }
}

export class SignItem extends PureComponent {

  static propTypes = {
    file: PropTypes.object.isRequired,
    completeLabels: PropTypes.array.isRequired,
    completeUrls: PropTypes.array.isRequired,
    localization: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
  };

  get label() {
    return (this.props.file.sign && this.props.file.sign.label) || '';
  }

  get url() {
    return (this.props.file.sign && this.props.file.sign.url) || '';
  }

  handleUpdateLabel = (label) => {

    const sign = label ? {
      label,
      url: this.url,
    } : null;

    this.props.onUpdate(this.props.file, sign);

    return sign;
  };

  handleUpdateUrl = (url) => {

    const sign = this.label ? {
      label: this.label,
      url,
    } : null;

    this.props.onUpdate(this.props.file, sign);

    return sign;
  };

  handleCompleteLabel = (label) => {
    const sign = this.handleUpdateLabel(label);
    this.props.onComplete(sign);
  };

  handleCompleteUrl = (url) => {
    const sign = this.handleUpdateUrl(url);
    this.props.onComplete(sign);
  };

  render() {
    const {
      file,
      localization,
    } = this.props;

    return (
      <div style={{ marginBottom: 16 }}>
        <AutoComplete fullWidth
          searchText={this.label}
          floatingLabelText={localization.credit.whoMade(file.name)}
          hintText="(c) 2017 Teramoto Daiki"
          dataSource={this.props.completeLabels}
          onUpdateInput={this.handleUpdateLabel}
          onNewRequest={this.handleCompleteLabel}
        />
        <AutoComplete fullWidth
          searchText={this.url}
          floatingLabelText={localization.credit.website}
          hintText="https://github.com/teramotodaiki/h4p"
          dataSource={this.props.completeUrls}
          onUpdateInput={this.handleUpdateUrl}
          onNewRequest={this.handleCompleteUrl}
        />
      </div>
    );
  }
}
