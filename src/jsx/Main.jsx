import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


import { makeFromFile, makeFromType } from '../js/files';
import Dock from './Dock';
import Postmate from '../js/LoosePostmate';
import Menu from './Menu';
import EditorPane from './EditorPane';
import ResourcePane from './ResourcePane';
import ScreenPane from './ScreenPane';
import Sizer from './Sizer';

import ContextMenu from './ContextMenu';
import FileDialog, { DialogTypes } from './FileDialog/';

class Main extends Component {

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
    isPopout: false,
    reboot: false,

    tabContextMenu: {},
    selectedFile: null,

    editorOptions: {
      tabVisibility: false,
    }

  };

  componentDidMount() {
    const { player, config: { files } } = this.props;

    this.setState({ files, reboot: true }, () => {
      if (files.length > 0) {
        this.selectFile(files[0]);
      }
    });
  }

  componentDidUpdate() {
    if (this.state.reboot) {
      this.setState({ reboot: false });
    }
  }

  addFile = (file) => new Promise((resolve, reject) => {
    const files = this.state.files.concat(file);
    if (this.inspection(file, reject)) {
      resolve(file);
      return;
    }
    this.setState({ files }, () => {
      if (file.options.isOpened) {
        this.selectFile(file, (lastFile) => resolve(lastFile));
      } else {
        resolve(file);
      }
    });
  });

  updateFile = (file, updated) => new Promise((resolve, reject) => {
    const nextFile = Object.assign({}, file, updated);
    if (this.inspection(nextFile)) {
      resolve(file);
      return;
    }
    const files = this.state.files.map((item) => item === file ? nextFile : item);
    this.setState({ files }, () => {
      if (file === this.state.selectedFile && nextFile.options.isOpened) {
        this.selectFile(nextFile).then(resolve);
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
      if (!file.options.isOpened) {
        const options = Object.assign({}, file.options, { isOpened: true });
        this.updateFile(this.state.selectedFile, { options })
          .then(lastFile => resolve(lastFile));
      } else {
        resolve(file);
      }
    });
  });

  switchEntryPoint = (file) => {
    const files = this.state.files.map(item => {
      const options = Object.assign({}, item.options, { isEntryPoint: item === file });
      return Object.assign({}, item, options);
    });
    this.setState({ files });
  };

  inspection = (newFile, reject) => {
    const { files } = this.state;
    // file.name should be unique
    if (files.some(file => file.name === newFile.name && file.key !== newFile.key)) {
      return true;
    }
    return false;
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
    this.setState({ reboot: true });
  };

  handleTogglePopout = () => {
    const isPopout = !this.state.isPopout;
    this.setState({ isPopout, reboot: true });
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

  render() {
    const {
      files,
      dialogContent,
      openDialogType,
      tabContextMenu,
      selectedFile,
      primaryStyle,
      editorOptions,
      isPopout,
      reboot,
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
            />
            <EditorPane
              files={files}
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
              isPopout={isPopout}
              handleRun={this.handleRun}
              openFileDialog={this.openFileDialog}
              handleTogglePopout={this.handleTogglePopout}
              style={{ flex: '0 0 auto' }}
            />
            <ResourcePane
              files={files}
              selectedFile={selectedFile}
              addFile={this.addFile}
              updateFile={this.updateFile}
              selectFile={this.selectFile}
              openFileDialog={this.openFileDialog}
              style={{ flex: '1 1 auto' }}
            />
          </Dock>
          <ScreenPane
            player={player}
            config={config}
            files={files}
            isPopout={isPopout}
            reboot={reboot}
            handlePopoutClose={this.handleTogglePopout}
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

export default DragDropContext(HTML5Backend)(Main);
