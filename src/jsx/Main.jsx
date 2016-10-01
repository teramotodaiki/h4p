import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


import Dock from './Dock';
import Postmate from '../js/LoosePostmate';
import Menu from './Menu';
import EditorPane from './EditorPane';
import ResourcePane from './ResourcePane';
import Screen from './Screen';
import Sizer from './Sizer';

import ContextMenu from './ContextMenu';
import FileDialog, { DialogTypes } from './FileDialog/';

export default class Main extends Component {

  static propTypes = {
    player: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired
  };

  state = {
    primaryStyle: {
      width: 400,
      zIndex: 200,
    },
    secondaryStyle: {
      height: 400,
      zIndex: 100,
    },

    app: {},
    files: [],

    tabContextMenu: {},
    openDialogType: null,
    dialogContent: null,
    selectedFile: null,

    editorOptions: {
      tabVisibility: false,
    }

  };

  constructor(props) {
    super(props);
  }

  static fileIndex = 0;
  componentDidMount() {
    const { config } = this.props;

    const files = config.files.map(file => {
      const key = ++Main.fileIndex;
      return Object.assign({}, file, { key });
    });
    const app = Object.assign({}, config, { model: { files } });

    this.setState({ files, app }, () => {
      if (files.length > 0) {
        this.selectFile(files[0]);
      }
    });
  }

  addFile = (file) => {
    const key = ++Main.fileIndex;
    const add = Object.assign({}, file, { key });
    const files = this.state.files.concat(add);
    this.setState({ files });
  };

  updateFile = (file, updated) => {
    const isSelected = file === this.state.selectedFile;
    const nextFile = Object.assign({}, file, updated);
    const files = this.state.files.map((item) => item === file ? nextFile : item);
    this.setState({ files }, () => {
      if (isSelected) {
        this.selectFile(nextFile);
      }
    });
  };

  deleteFile = (file) => {
    const files = this.state.files.filter((item) => item !== file);
    this.setState({ files });
  };

  selectFile = (file) => {
    // Select and open the file
    this.setState({ selectedFile: file }, () => {
      if (!file.isOpened) {
        this.updateFile(this.state.selectedFile, { isOpened: true });
      }
    });
  };

  switchEntryPoint = (file) => {
    const nextSelectFile = Object.assign({}, file, { isEntryPoint: true });
    const files = this.state.files.map(item => 
      item === file ? nextSelectFile : Object.assign({}, item, { isEntryPoint: false }));
    this.setState({ files }, () => this.selectFile(nextSelectFile));
  };

  handleResize = (primaryWidth, secondaryHeight) => {
    const primaryStyle = Object.assign({}, this.state.primaryStyle, {
      width: primaryWidth
    });
    const secondaryStyle = Object.assign({}, this.state.secondaryStyle, {
      height: secondaryHeight
    });
    this.setState({ primaryStyle, secondaryStyle });
  };

  handleRun = () => {
    const files = this.state.files.map((item) => Object.assign({}, item));
    const app = Object.assign({}, this.state.app, { model: { files } });
    this.setState({ app });
  };

  handleTabContextMenu = (tabContextMenu) => {
    this.setState({ tabContextMenu })
  };

  handleContextMenuClose() {
    this.setState({ tabContextMenu: {} });
  }

  handleContextSave = () => {
    const file = this.state.tabContextMenu.file;
    if (!file) return;
    this.handleOpenDialog(DialogTypes.Save, file);
  };

  handleContextRename = () => {
    const file = this.state.tabContextMenu.file;
    if (!file) return;
    this.handleOpenDialog(DialogTypes.Rename, file);
  };

  handleContextSwitch = () => {
    const switchFile = this.state.tabContextMenu.file;
    if (!switchFile) return;
    this.switchEntryPoint(switchFile);
    this.setState({ tabContextMenu: {} });
  };

  handleContextDelete = () => {
    const file = this.state.tabContextMenu.file;
    if (!file) return;
    this.handleOpenDialog(DialogTypes.Delete, file);
  };

  handleOpenDialog = (openDialogType, dialogContent) => {
    this.setState({ openDialogType, dialogContent, tabContextMenu: {} });
  };

  handleCloseDialog = () => {
    this.setState({ openDialogType: null, dialogContent: null });
  };

  handleEditorOptionChange = (change) => {
    const editorOptions = Object.assign({}, this.state.editorOptions, change);
    this.setState({ editorOptions });
  };

  render() {
    const {
      files,
      dialogContent,
      openDialogType,
      tabContextMenu,
      selectedFile,
      primaryStyle,
      app,
      editorOptions
    } = this.state;
    const { player, config } = this.props;

    const menuList = [
      {
        primaryText: 'Save as',
        onTouchTap: this.handleContextSave
      },
      {
        primaryText: 'Rename',
        onTouchTap: this.handleContextRename
      },
      {
        primaryText: 'Switch entry point',
        onTouchTap: this.handleContextSwitch
      },
      {
        primaryText: 'Delete',
        onTouchTap: this.handleContextDelete
      }
    ];

    const secondaryStyle = Object.assign({
      flexDirection: 'column',
      boxSizing: 'border-box',
      paddingRight: primaryStyle.width,
    }, this.state.secondaryStyle);

    const inlineScreenStyle = {
      boxSizing: 'border-box',
      width: '100vw',
      height: '100vh',
      paddingRight: primaryStyle.width,
      paddingBottom: secondaryStyle.height
    };

    return (
      <MuiThemeProvider>
        <div>
          <Dock config={config} align="right" style={primaryStyle}>
            <Sizer
              handleResize={this.handleResize}
              primaryWidth={primaryStyle.width}
              secondaryHeight={secondaryStyle.height}
              style={{ flex: '0 0 auto' }}
            />
            <EditorPane
              files={files.filter(file => file.isOpened)}
              updateFile={this.updateFile}
              selectFile={this.selectFile}
              selectedFile={selectedFile}
              onTabContextMenu={this.handleTabContextMenu}
              editorOptions={editorOptions}
              handleEditorOptionChange={this.handleEditorOptionChange}
              handleOpenDialog={this.handleOpenDialog}
              style={{ flex: '1 1 auto' }}
            />
          </Dock>
          <Dock config={config} align="bottom" style={secondaryStyle}>
            <Menu
              files={files}
              handleRun={this.handleRun}
              handleOpenDialog={this.handleOpenDialog}
              style={{ flex: '0 0 auto' }}
            />
            <ResourcePane
              files={files}
              addFile={this.addFile}
              selectFile={this.selectFile}
              style={{ flex: '1 1 auto' }}
            />
          </Dock>
          <Dock config={config} align="left" style={inlineScreenStyle}>
            <Screen
              player={player}
              app={app}
              style={{ flex: '1 1 auto' }}
            />
          </Dock>
          <ContextMenu
            menuList={menuList}
            openEvent={tabContextMenu.event}
            onClose={this.handleContextMenuClose}
          />
          <FileDialog
            open={!!openDialogType}
            type={openDialogType}
            content={dialogContent}
            addFile={this.addFile}
            updateFile={this.updateFile}
            deleteFile={this.deleteFile}
            onRequestClose={this.handleCloseDialog}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}
