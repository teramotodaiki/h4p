import React, { Component, PropTypes } from 'react';


import DirCard from './DirCard';
import getHierarchy from './getHierarchy';

const getStyles = (props, context) => {
  return {
    root: {
      boxSizing: 'border-box',
      width: '100%',
    },
  };
};

export default class Hierarchy extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    isDirOpened: PropTypes.func.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
    handleDirToggle: PropTypes.func.isRequired,
    handleFileMove: PropTypes.func.isRequired,
    handleNativeDrop: PropTypes.func.isRequired,
    handleNameChange: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const { files } = this.props;

    const transfer = {
      selectedFile: this.props.selectedFile,
      tabbedFiles: this.props.tabbedFiles,
      isDirOpened: this.props.isDirOpened,
      handleFileSelect: this.props.handleFileSelect,
      handleDirToggle: this.props.handleDirToggle,
      handleFileMove: this.props.handleFileMove,
      handleNativeDrop: this.props.handleNativeDrop,
      handleNameChange: this.props.handleNameChange,
    };

    const { root } = getStyles(this.props, this.context);
    const { prepareStyles } = this.context.muiTheme;

    return (
      <div style={prepareStyles(root)}>
        <DirCard dir={getHierarchy(files)} {...transfer} isRoot />
      </div>
    );
  }
}
