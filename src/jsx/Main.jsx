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

    files: [],
    isPopup: false,

    tabContextMenu: {},
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
    const { player, config } = this.props;

    const files = config.files.map(file => {
      const key = ++Main.fileIndex;
      return Object.assign({}, file, { key });
    });

    this.setState({ files }, () => {
      if (files.length > 0) {
        this.selectFile(files[0]);
      }
      this.launchApp();
    });
  }

  addFile = (file) => new Promise((resolve, reject) => {
    const key = ++Main.fileIndex;
    const add = Object.assign({}, file, { key });
    const files = this.state.files.concat(add);
    this.setState({ files }, () => {
      if (file.isOpened) {
        this.selectFile(add, (lastFile) => resolve(lastFile));
      } else {
        resolve(add);
      }
    });
  });

  updateFile = (file, updated) => new Promise((resolve, reject) => {
    const nextFile = Object.assign({}, file, updated);
    const files = this.state.files.map((item) => item === file ? nextFile : item);
    this.setState({ files }, () => {
      if (file === this.state.selectedFile && nextFile.isOpened) {
        this.selectFile(nextFile)
          .then(lastFile => resolve(lastFile));
      } else {
        resolve(nextFile);
      }
    });
  });

  deleteFile = (file) => new Promise((resolve, reject) => {
    const files = this.state.files.filter((item) => item !== file);
    this.setState({ files }, resolve);
  });

  selectFile = (file) => new Promise((resolve, reject) => {
    // Select and open the file
    this.setState({ selectedFile: file }, () => {
      if (!file.isOpened) {
        this.updateFile(this.state.selectedFile, { isOpened: true })
          .then(lastFile => resolve(lastFile));
      } else {
        resolve(file);
      }
    });
  });

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
    this.launchApp();
  };

  handleTogglePopup = () => {
    const isPopup = !this.state.isPopup;
    this.launchApp(isPopup);
    this.setState({ isPopup });
  };

  handleTabContextMenu = (tabContextMenu) => {
    this.setState({ tabContextMenu })
  };

  handleContextMenuClose() {
    this.setState({ tabContextMenu: {} });
  }

  handleContextSave = () => {
    const content = this.state.tabContextMenu.file;
    if (!content) return;
    this.openFileDialog(DialogTypes.Save, { content });
    this.setState({ tabContextMenu: {} });
  };

  handleContextRename = () => {
    const content = this.state.tabContextMenu.file;
    if (!content) return;
    this.openFileDialog(DialogTypes.Rename, { content })
      .then((updated) => this.updateFile(content, updated));
    this.setState({ tabContextMenu: {} });
  };

  handleContextSwitch = () => {
    const switchFile = this.state.tabContextMenu.file;
    if (!switchFile) return;
    this.switchEntryPoint(switchFile);
    this.setState({ tabContextMenu: {} });
  };

  handleContextDelete = () => {
    const content = this.state.tabContextMenu.file;
    if (!content) return;
    this.openFileDialog(DialogTypes.Delete, { content })
      .then(this.deleteFile);
    this.setState({ tabContextMenu: {} });
  };

  handleEditorOptionChange = (change) => {
    const editorOptions = Object.assign({}, this.state.editorOptions, change);
    this.setState({ editorOptions });
  };

  openFileDialog = () => console.error('openFileDialog has not be declared');
  handleFileDialog = (ref) => this.openFileDialog = ref.open;

  launchApp = () => console.error('launchApp has not be declared');
  handleScreen = (ref) => this.launchApp = ref.start;

  render() {
    const {
      files,
      dialogContent,
      openDialogType,
      tabContextMenu,
      selectedFile,
      primaryStyle,
      editorOptions,
      isPopup,
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
        <div style={{ backgroundColor: 'inherit' }}>
          <Dock config={config} align="right" style={primaryStyle}>
            <Sizer
              handleResize={this.handleResize}
              primaryWidth={primaryStyle.width}
              secondaryHeight={secondaryStyle.height}
              style={{ flex: '0 0 auto' }}
            />
            <EditorPane
              files={files.filter(file => file.isOpened)}
              addFile={this.addFile}
              updateFile={this.updateFile}
              selectFile={this.selectFile}
              selectedFile={selectedFile}
              handleRun={this.handleRun}
              onTabContextMenu={this.handleTabContextMenu}
              editorOptions={editorOptions}
              handleEditorOptionChange={this.handleEditorOptionChange}
              openFileDialog={this.openFileDialog}
              style={{ flex: '1 1 auto' }}
            />
          </Dock>
          <Dock config={config} align="bottom" style={secondaryStyle}>
            <Menu
              player={player}
              files={files}
              isPopup={isPopup}
              handleRun={this.handleRun}
              openFileDialog={this.openFileDialog}
              handleTogglePopup={this.handleTogglePopup}
              style={{ flex: '0 0 auto' }}
            />
            <ResourcePane
              files={files}
              addFile={this.addFile}
              selectFile={this.selectFile}
              openFileDialog={this.openFileDialog}
              style={{ flex: '1 1 auto' }}
            />
          </Dock>
          <Screen
            ref={this.handleScreen}
            player={player}
            config={config}
            files={files}
            isPopup={isPopup}
            style={inlineScreenStyle}
          />
          <ContextMenu
            menuList={menuList}
            openEvent={tabContextMenu.event}
            onClose={this.handleContextMenuClose}
          />
          <FileDialog ref={this.handleFileDialog} />
        </div>
      </MuiThemeProvider>
    );
  }
}
