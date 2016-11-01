import React, { Component, PropTypes } from 'react';
import { faintBlack } from 'material-ui/styles/colors';


import { SignDialog } from '../FileDialog/';
import { makeFromFile, changeName, changeDir } from '../js/files';
import Hierarchy from '../Hierarchy/';
import SearchBar from '../SearchBar/';
import { allVisibleFiles } from '../SearchBar/';

const getStyles = (props, context) => {
  const {
    spacing,
    prepareStyles,
  } = context.muiTheme;

  return {
    root: prepareStyles({
      flex: '1 1 auto',
      position: 'relative',
      overflow: 'hidden',
    }),
    scroll: prepareStyles({
      position: 'absolute',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      paddingTop: spacing.desktopGutterMore,
      paddingBottom: spacing.desktopGutterMore,
      overflowY: 'scroll',
    })
  };
};

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

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    openedPaths: [''],
    filter: allVisibleFiles(),
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
    const { filter } = this.state;

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

    const {
      root,
      scroll,
    } = getStyles(this.props, this.context);

    return (
      <div style={root}>
        <SearchBar filterRef={(filter) => this.setState({ filter })} />
        <div style={scroll}>
          <Hierarchy files={files.filter(filter)} {...transfer} />
        </div>
      </div>
    );
  }
}
