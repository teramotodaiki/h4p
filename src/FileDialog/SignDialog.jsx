import React, { PureComponent, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';

import { Confirm, Abort } from './Buttons';

const arrayOf = (a) => a instanceof Array ? a : [a];

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
    files: arrayOf(this.props.content),
    completeLabels: [],
    completeUrls: [],
  };

  componentDidMount() {
    const credits = this.props.getFiles()
      .reduce((p, c) => p.concat(c.credits).concat(c.sign), [])
      .filter((item) => item);
    const completeLabels = credits
      .map((item) => item.label)
      .filter((item, i, array) => item && array.indexOf(item) === i);
    const completeUrls = credits
      .map((item) => item.url)
      .filter((item, i, array) => item && array.indexOf(item) === i);

    if (completeLabels.length > 0 || completeUrls.length > 0) {
      this.setState({ completeLabels, completeUrls, });
    }
  }

  handleUpdate = (file, sign) => {
    if (file.sign === sign) return;

    const files = this.state.files
      .map((item) => item === file ? item.set({ sign }) : item);

    this.setState({ files });
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

  };

  handleUpdateUrl = (url) => {

    const sign = this.label ? {
      label: this.label,
      url,
    } : null;

    this.props.onUpdate(this.props.file, sign);

  }

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
          onNewRequest={this.handleUpdateLabel}
        />
        <AutoComplete fullWidth
          searchText={this.url}
          floatingLabelText={localization.credit.website}
          hintText="https://github.com/teramotodaiki/h4p"
          dataSource={this.props.completeUrls}
          onUpdateInput={this.handleUpdateUrl}
          onNewRequest={this.handleUpdateUrl}
        />
      </div>
    );
  }
}
