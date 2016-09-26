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
import SaveDialog from './SaveDialog';
import RenameDialog from './RenameDialog';
import DeleteDialog from './DeleteDialog';

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
      flexDirection: 'column'
    },

    app: {},
    files: [],

    tabContextMenu: {},
    saveFile: null,
    renameFile: null,
    deleteFile: null,

    tabVisible: false

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

    this.setState({ files, app });
  }

  updateFile = (file, updated) => {
    const nextFile = Object.assign({}, file, updated);
    const files = this.state.files.map((item) => item === file ? nextFile : item);
    this.setState({ files });
  };

  removeFile = (file) => {
    const files = this.state.files.filter((item) => item !== file);
    this.setState({ files });
  };

  switchEntryPoint = (file) => {
    const files = this.state.files.map((item) =>
      Object.assign({}, item, { isEntryPoint: item === file }));
    this.setState({ files });
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

  toggleTabVisible = () => {
      this.setState({ tabVisible: !this.state.tabVisible });
  };

  closeSaveDialog = () => {
    this.setState({ saveFile: null });
  };

  closeRenameDialog = () => {
    this.setState({ renameFile: null });
  };

  closeDeleteDialog = () => {
    this.setState({ deleteFile: null });
  };

  handleTabContextMenu = (tabContextMenu) => {
    this.setState({ tabContextMenu })
  };

  handleContextMenuClose() {
    this.setState({ tabContextMenu: {} });
  }

  handleSave = () => {
    const saveFile = this.state.tabContextMenu.file;
    if (!saveFile) return;
    this.setState({ saveFile, tabContextMenu: {} });
  };

  handleRename = () => {
    const renameFile = this.state.tabContextMenu.file;
    if (!renameFile) return;
    this.setState({ renameFile, tabContextMenu: {} });
  };

  handleSwitch = () => {
    const switchFile = this.state.tabContextMenu.file;
    if (!switchFile) return;
    this.switchEntryPoint(switchFile);
    this.setState({ tabContextMenu: {} });
  }

  handleDelete = () => {
    const deleteFile = this.state.tabContextMenu.file;
    if (!deleteFile) return;
    this.setState({ deleteFile, tabContextMenu: {} });
  };

  render() {
    const { files, saveFile, renameFile, deleteFile, tabContextMenu, tabVisible, primaryStyle, secondaryStyle, app } = this.state;
    const { player, config } = this.props;

    const menuList = [
      {
        primaryText: 'Save as',
        onTouchTap: this.handleSave
      },
      {
        primaryText: 'Rename',
        onTouchTap: this.handleRename
      },
      {
        primaryText: 'Switch entry point',
        onTouchTap: this.handleSwitch
      },
      {
        primaryText: 'Delete',
        onTouchTap: this.handleDelete
      }
    ];

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
              files={files}
              updateFile={this.updateFile}
              onTabContextMenu={this.handleTabContextMenu}
              tabVisible={tabVisible}
              style={{ flex: '1 1 auto' }}
            />
          </Dock>
          <Dock config={config} align="bottom" style={secondaryStyle}>
            <Menu
              files={files}
              handleRun={this.handleRun}
              toggleTabVisible={this.toggleTabVisible}
              style={{ flex: '0 0 auto' }}
            />
            <ResourcePane

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
          <SaveDialog
            open={!!saveFile}
            file={saveFile}
            onRequestClose={this.closeSaveDialog}
          />
          <RenameDialog
            open={!!renameFile}
            file={renameFile}
            updateFilename={(filename) => this.updateFile(renameFile, { filename })}
            onRequestClose={this.closeRenameDialog}
          />
          <DeleteDialog
            open={!!deleteFile}
            file={deleteFile}
            deleteFile={this.removeFile}
            onRequestClose={this.closeDeleteDialog}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}
