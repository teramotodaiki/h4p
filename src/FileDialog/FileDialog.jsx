import React, { Component, PropTypes } from 'react';


export default class FileDialog extends Component {

  static propTypes = {
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
  };

  state = {
    dialogInstance: null,
  };

  open = (reactClass, props) =>
    new Promise((resolve, reject) => {
      props = Object.assign({}, this.props, props, {
        resolve, reject,
        onRequestClose: () => {
          resolve();
          this.setState({ dialogInstance: null });
        },
      });
      const dialogInstance = React.createElement(reactClass, props);
      this.setState({ dialogInstance });
    });

  render () {
    return this.state.dialogInstance;
  }

}
