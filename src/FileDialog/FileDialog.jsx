import React, { Component, PropTypes } from 'react';


export default class FileDialog extends Component {

  static propTypes = {
    localization: PropTypes.object.isRequired,
  };

  state = {
    dialogInstance: null,
  };

  open = (reactClass, props) =>
    new Promise((resolve, reject) => {
      props = Object.assign({}, this.props, props, {
        resolve, reject,
        onRequestClose: this.close,
      });
      const dialogInstance = React.createElement(reactClass, props);
      this.setState({ dialogInstance });
    });

  close = () =>
    this.setState({ dialogInstance: null });

  render () {
    return this.state.dialogInstance;
  }

}
