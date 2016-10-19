import React, { Component, PropTypes } from 'react';


import DirCard, { getHierarchy } from './DirCard';

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
    };

    const style = {
      boxSizing: 'border-box',
      width: '100%',
    };

    return (
      <div style={style}>
        <DirCard dir={getHierarchy(files)} {...transfer} isRoot />
      </div>
    );
  }
}
