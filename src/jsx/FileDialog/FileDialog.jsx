import React, { Component, PropTypes } from 'react';


export default class FileDialog extends Component {

  state = {
    dialogInstance: null,
  };

  open = (reactClass, props) =>
    new Promise((resolve, reject) => {
      props = Object.assign({}, props, {
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
