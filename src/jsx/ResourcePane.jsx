import React, { Component, PropTypes } from 'react';
import { faintBlack } from 'material-ui/styles/colors';


import { DialogTypes } from './FileDialog/';
import { makeFromFile } from '../js/files';
import Hierarchy from './Hierarchy/';

export default class ResourcePane extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    updateFile: PropTypes.func.isRequired,
    selectFile: PropTypes.func.isRequired,
    selectedFile: PropTypes.object,
    openFileDialog: PropTypes.func.isRequired,
  };

  state = {
    selectedKeys: [],
    openedPaths: ['']
  };

  handleDrop = (event) => {
    const { addFile, selectFile, openFileDialog } = this.props;
    event.preventDefault();

    Array.from(event.dataTransfer.files)
    .map(file => () => {
      const content = { name: file.name };
      return Promise.all([
        makeFromFile(file),
        openFileDialog(DialogTypes.Sign, { content })
      ])
      .then(([file, author]) => Object.assign({}, file, { author }))
      .then(addFile)
      .then(selectFile);
    })
    .reduce((p, c) => {
      return p.then(c);
    }, Promise.resolve());
  };

  handleDragOver = (event) => {
    event.preventDefault();
  };

  handleSelectFile = (file) => {
    if (this.isSelected(file, true)) {
      const selectedKeys = this.state.selectedKeys.filter(key => key !== file.key);
      this.setState({ selectedKeys });
    } else {
      const selectedKeys = this.state.selectedKeys.concat(file.key);
      this.setState({ selectedKeys });
      this.props.selectFile(file);
    }
  };

  handleDirToggle = (dir) => {
    const openedPaths = this.isDirOpened(dir,
      this.state.openedPaths.filter(path => path !== dir.path),
      this.state.openedPaths.concat(dir.path)
    );
    this.setState({ openedPaths });
  };

  handleFileMove = (file, dir) => {
    const { updateFile } = this.props;

    if (file.name.includes('/')) {
      const name = file.name.replace(/.*\//, dir.path);
      return updateFile(file, { name });
    } else {
      const name = dir.path + file.name;
      return updateFile(file, { name });
    }
  };

  isSelected = (file, passed, abort) => {
    return this.state.selectedKeys.indexOf(file.key) > -1 ? passed : abort;
  }

  isSelectedOne = (file, passed, abort) => {
    return this.props.selectedFile === file ? passed : abort;
  };

  isDirOpened = (dir, passed, abort) => {
    return this.state.openedPaths.indexOf(dir.path) > -1 ? passed : abort;
  };

  render() {
    const { files, selectFile } = this.props;

    const transfer = {
      isSelectedOne: this.isSelectedOne,
      isSelected: this.isSelected,
      handleSelectFile: this.handleSelectFile,
      isDirOpened: this.isDirOpened,
      handleDirToggle: this.handleDirToggle,
      handleFileMove: this.handleFileMove,
    };

    const style = Object.assign({}, this.props.style, {
      backgroundColor: faintBlack,
      overflowY: 'scroll',
      boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 3px 10px inset, rgba(0, 0, 0, 0.227451) 0px 3px 10px inset',
    });

    return (
      <div
        style={style}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
      >
        <Hierarchy files={files} {...transfer} />
      </div>
    );
  }
}
