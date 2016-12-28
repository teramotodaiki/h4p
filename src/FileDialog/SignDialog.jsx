import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';

import { Confirm, Abort } from './Buttons';

export default class SignDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any,
    getFiles: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  state = {
    label: this.props.content.sign ? this.props.content.sign.label : '',
    url: this.props.content.sign ? this.props.content.sign.url : '',
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

  handleUpdateLabel = (label) => {
    this.setState({ label });
  };

  handleUpdateUrl = (url) => {
    this.setState({ url });
  };

  handleSign = () => {
    this.props.resolve({
      label: this.state.label,
      url: this.state.url,
    });
    this.props.onRequestClose();
  };

  render() {
    const {
      open,
      onRequestClose,
      content,
      localization,
    } = this.props;

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
        <AutoComplete fullWidth
          searchText={this.state.label}
          floatingLabelText={localization.credit.whoMade(content.name)}
          hintText="(c) 2017 Teramoto Daiki"
          dataSource={this.state.completeLabels}
          onUpdateInput={this.handleUpdateLabel}
          onNewRequest={this.handleUpdateLabel}
        />
        <AutoComplete fullWidth
          searchText={this.state.url}
          floatingLabelText={localization.credit.website}
          hintText="https://github.com/teramotodaiki/h4p"
          dataSource={this.state.completeUrls}
          onUpdateInput={this.handleUpdateUrl}
          onNewRequest={this.handleUpdateUrl}
        />
      </Dialog>
    );
  }
}
