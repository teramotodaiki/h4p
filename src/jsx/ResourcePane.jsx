import React, { Component, PropTypes } from 'react';
import { faintBlack } from 'material-ui/styles/colors';


import { SignDialog } from '../FileDialog/';
import { makeFromFile, changeName, changeDir } from '../js/files';
import Hierarchy from '../Hierarchy/';

export default class ResourcePane extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    updateFile: PropTypes.func.isRequired,
    selectFile: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
  };

  state = {
    openedPaths: ['']
  };

  handleNativeDrop = (files, dir) => {
    const { addFile, selectFile, openFileDialog } = this.props;

    files.map(file => () => {
      const content = { name: file.name };
      return Promise.all([
        makeFromFile(file),
        openFileDialog(SignDialog, { content })
      ])
      .then(([file, author]) => Object.assign({}, file, { author }))
      .then(file => changeDir(file, dir.path))
      .then(addFile)
      .then(selectFile);
    })
    .reduce((p, c) => {
      return p.then(c);
    }, Promise.resolve());
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

    return updateFile(file, changeDir(file, dir.path));
  };

  handleFileSelect = (file) => {
    const { selectFile, closeTab, selectedFile } = this.props;

    if (file === selectedFile) {
      closeTab(file);
    } else {
      selectFile(file);
    }
  };

  handleNameChange = (file, name) => {
    const { updateFile } = this.props;

    return updateFile(file, changeName(file, name));
  };

  isDirOpened = (dir, passed, failed) => {
    return this.state.openedPaths.includes(dir.path) ? passed : failed;
  };

  render() {
    const { files, selectFile, selectedFile, tabbedFiles } = this.props;

    const transfer = {
      selectedFile,
      tabbedFiles,
      isDirOpened: this.isDirOpened,
      handleFileSelect: this.handleFileSelect,
      handleDirToggle: this.handleDirToggle,
      handleFileMove: this.handleFileMove,
      handleNativeDrop: this.handleNativeDrop,
      handleNameChange: this.handleNameChange,
    };

    const style = Object.assign({}, this.props.style, {
      backgroundColor: faintBlack,
      overflowY: 'scroll',
      boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 3px 10px inset, rgba(0, 0, 0, 0.227451) 0px 3px 10px inset',
    });

    return (
      <div style={style}>
        <Hierarchy files={files} {...transfer} />
      </div>
    );
  }
}
