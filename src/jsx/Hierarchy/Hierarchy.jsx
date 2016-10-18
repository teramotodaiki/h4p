import React, { Component, PropTypes } from 'react';


import DirCard, { getHierarchy } from './DirCard';

export default class Hierarchy extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    isSelectedOne: PropTypes.func.isRequired,
    isSelected: PropTypes.func.isRequired,
    handleSelectFile: PropTypes.func.isRequired,
    isDirOpened: PropTypes.func.isRequired,
    handleDirToggle: PropTypes.func.isRequired,
  };

  render() {

    const transfer = {
      isSelectedOne: this.props.isSelectedOne,
      isSelected: this.props.isSelected,
      handleSelectFile: this.props.handleSelectFile,
      isDirOpened: this.props.isDirOpened,
      handleDirToggle: this.props.handleDirToggle,
    };

    const style = {
      boxSizing: 'border-box',
      padding: '3rem 0 3rem 1rem',
      width: '100%',
    };

    return (
      <div style={style}>
        <DirCard dir={getHierarchy(this.props.files)} {...transfer} isRoot />
      </div>
    );
  }
}
