import React, { Component, PropTypes } from 'react';


import { makeFromFile } from '../File/';
import { SignDialog } from '../FileDialog/';
import { Tab } from '../ChromeTab/';
import Root from './Root';
import SearchBar from './SearchBar';

const getStyles = (props, context) => {
  const {
    spacing,
    prepareStyles,
  } = context.muiTheme;

  return {
    root: prepareStyles({
      flex: '1 1 auto',
      position: 'relative',
    }),
    scroll: prepareStyles({
      position: 'absolute',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      paddingTop: spacing.desktopGutterMore,
      paddingBottom: spacing.desktopGutterMore,
      overflowY: 'scroll',
      direction: 'rtl',
    })
  };
};

export default class Hierarchy extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    tabs: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    deleteFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired,
    isShrinked: PropTypes.bool.isRequired,
    localization: PropTypes.object.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    openedPaths: [''],
    filter: (file) => false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.isResizing) {
      return false;
    }
    return true;
  }

  handleNativeDrop = (files, dir = null) => {
    const { addFile, selectTab, openFileDialog } = this.props;

    files.map(file => () => {
      const content = { name: file.name };
      return Promise.all([
        makeFromFile(file),
        openFileDialog(SignDialog, { content })
      ])
      .then(([file, author]) => file.set({ author }))
      .then(file => dir ? file.move(dir.path) : file)
      .then(addFile)
      .then(selectTab);
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
    const { putFile } = this.props;

    return putFile(file, file.move(dir.path));
  };

  handleFileSelect = (file) => {
    const { selectTab, closeTab, tabs, files } = this.props;

    const opened = tabs.find((tab) => (
      tab.file === file && !tab.props.component
    ));

    if (opened) {
      if (opened.isSelected) {
        closeTab(opened);
      } else {
        selectTab(opened);
      }
    } else {
      const getFile = () => files.find(({key}) => key === file.key);
      selectTab(new Tab({ getFile }));
    }
  };

  isDirOpened = (dir, passed, failed) => {
    return this.state.openedPaths.includes(dir.path) ? passed : failed;
  };

  handleDelete = () => {
    this.props.files.filter(this.state.filter)
      .map((file) => this.props.deleteFile(file));
  };

  render() {
    if (this.props.isShrinked) {
      return null;
    }

    const {
      files,
      selectTab,
      putFile,
      openFileDialog,
      localization,
    } = this.props;
    const { filter } = this.state;

    const tabs = this.props.tabs
      .filter((tab) => !tab.props.component);
    const selected = tabs.find((tab) => tab.isSelected);
    const tabbedFiles = tabs.map((tab) => tab.file);

    const transfer = {
      selectedFile: selected && selected.file,
      tabbedFiles,
      openFileDialog,
      putFile,
      isDirOpened: this.isDirOpened,
      handleFileSelect: this.handleFileSelect,
      handleDirToggle: this.handleDirToggle,
      handleFileMove: this.handleFileMove,
      handleNativeDrop: this.handleNativeDrop,
    };

    const {
      root,
      scroll,
    } = getStyles(this.props, this.context);

    return (
      <div style={root}>
        <SearchBar
          files={files}
          filterRef={(filter) => this.setState({ filter })}
          putFile={putFile}
          deleteAll={this.handleDelete}
          onOpen={this.handleNativeDrop}
          openFileDialog={openFileDialog}
          localization={localization}
        />
        <div style={scroll}>
          <Root files={files.filter(filter)} {...transfer} />
        </div>
      </div>
    );
  }
}
