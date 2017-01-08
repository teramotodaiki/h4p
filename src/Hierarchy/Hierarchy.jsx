import React, { Component, PropTypes } from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';


import { makeFromFile, SourceFile } from '../File/';
import { SignDialog, AddDialog } from '../FileDialog/';
import { Tab } from '../ChromeTab/';
import Root from './Root';
import SearchBar from './SearchBar';

const getStyles = (props, context) => {
  const {
    spacing,
    prepareStyles,
  } = context.muiTheme;

  return {
    root: {
      position: 'relative',
      flex: '0 0 auto',
      height: 500,
      marginBottom: 16,
    },
    scroll: prepareStyles({
      position: 'absolute',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      paddingTop: spacing.desktopGutterMore,
      paddingBottom: 80,
      overflowY: 'scroll',
      direction: 'rtl',
    }),
    button: {
      position: 'absolute',
      right: 23,
      bottom: 23,
      zIndex: 1000,
    },
  };
};

export default class Hierarchy extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    tabs: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    deleteFile: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    saveAs: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired,
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
    const getFiles = () => this.props.files;

    files.map(file => () => {
      const content = { name: file.name };
      return Promise.all([
        makeFromFile(file),
        openFileDialog(SignDialog, { content, getFiles })
      ])
      .then(([file, sign]) => file.set({ sign }))
      .then(file => dir ? file.move(dir.path) : file)
      .then(addFile)
      .then(this.handleFileSelect);
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
    const { selectTab, closeTab, tabs, findFile } = this.props;

    const getFile = () => findFile(({key}) => key === file.key);
    const tab = new Tab({ getFile });

    const selected = tabs.find((tab) => tab.isSelected);

    if (selected && selected.is(tab)) {
      closeTab(selected);
    } else {
      selectTab(tab);
    }
  };

  isDirOpened = (dir, passed, failed) => {
    return this.state.openedPaths.includes(dir.path) ? passed : failed;
  };

  handleDelete = () => {
    this.props.deleteFile(
      ...this.props.files.filter(this.state.filter)
    );
  };

  handleAdd = () => {
    const { openFileDialog, addFile } = this.props;
    openFileDialog(AddDialog)
      .then(seed => new SourceFile(seed))
      .then(file => addFile(file))
      .catch(() => {});
  };

  render() {
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
      button,
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
          saveAs={this.props.saveAs}
          localization={localization}
        />
        <div style={scroll}>
          <Root files={files.filter(filter)} {...transfer} />
        </div>
        <FloatingActionButton secondary
          style={button}
          onClick={this.handleAdd}
        >
          <ContentAdd />
        </FloatingActionButton>
      </div>
    );
  }
}
