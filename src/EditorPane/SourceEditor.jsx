import React, { Component, PropTypes } from 'react';


import Editor from './Editor';

export default class SourceEditor extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired,
    gutterMarginWidth: PropTypes.number,
    handleRun: PropTypes.func.isRequired,
    closeSelectedTab: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
    getConfig: PropTypes.func.isRequired,
  };

  static defaultProps = {
    gutterMarginWidth: 0,
    isCared: false,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    return (
      <Editor {...this.props} />
    );
  }
}
