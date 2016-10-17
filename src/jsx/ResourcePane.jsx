import React, { Component, PropTypes } from 'react';
import { faintBlack } from 'material-ui/styles/colors';


import { DialogTypes } from './FileDialog/';
import { makeFromFile } from '../js/files';
import DirCard, { getHierarchy } from './DirCard';


export default class ResourcePane extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
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

    const style = Object.assign({
      backgroundColor: faintBlack,
      padding: '3rem 0',
      overflowY: 'scroll',
    }, this.props.style);

    const transfer = {
      isSelectedOne: this.isSelectedOne,
      isSelected: this.isSelected,
      handleSelectFile: this.handleSelectFile,
      isDirOpened: this.isDirOpened,
      handleDirToggle: this.handleDirToggle,
    };

    return (
      <div
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
        style={style}
      >
        <DirCard dir={getHierarchy(files)} {...transfer} isRoot />
        <div>Drag and Drop here.</div>
      </div>
    );
  }
}
