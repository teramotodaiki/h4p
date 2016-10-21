import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
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

import FileDialog, { SaveDialog, RenameDialog, DeleteDialog } from './FileDialog/';

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

    selectedKey: null,
    tabbedKeys: [],

    editorOptions: {
      tabVisibility: false,
    },

    palette: {},

  };

  get selectedFile() {
    const { files, selectedKey } = this.state;
    return files.find(file => file.key === selectedKey);
  }

  get tabbedFiles() {
    const { files, tabbedKeys } = this.state;
    return tabbedKeys.map(key => files.find(file => key === file.key));
  }

  componentDidMount() {
    const { player, config: { files } } = this.props;

    const tabbedKeys = files
      .filter(file => file.options.isEntryPoint)
      .map(file => file.key);
    const selectedKey = tabbedKeys[0] || null;
    this.setState({ reboot: true, files, tabbedKeys, selectedKey });
  }

  componentDidUpdate() {
    if (this.state.reboot) {
      this.setState({ reboot: false });
    }
  }

  addFile = (file) => new Promise((resolve, reject) => {
    const files = this.state.files.concat(file);
    if (this.inspection(file)) {
      resolve(file);
      return;
    }
    this.setState({ files }, () => resolve(file));
  });

  updateFile = (file, updated) => new Promise((resolve, reject) => {
    const nextFile = Object.assign({}, file, updated);
    if (this.inspection(nextFile)) {
      resolve(file);
      return;
    }
    const files = this.state.files.map((item) => item === file ? nextFile : item);
    this.setState({ files }, () => resolve(nextFile));
  });

  deleteFile = (file) => new Promise((resolve, reject) => {
    const files = this.state.files.filter((item) => item.key !== file.key);
    this.setState({ files }, () => resolve());
  });

  selectFile = (file) => new Promise((resolve, reject) => {
    const selectedKey = file.key;
    if (this.state.tabbedKeys.includes(selectedKey)) {
      this.setState({ selectedKey }, () => resolve(file));
    } else {
      const tabbedKeys = this.state.tabbedKeys.concat(file.key);
      this.setState({ selectedKey, tabbedKeys }, () => resolve(file));
    }
  });

  switchEntryPoint = (file) => new Promise((resolve, reject) => {
    const files = this.state.files.map(item => {
      const options = Object.assign({}, item.options, { isEntryPoint: item.key === file.key });
      return Object.assign({}, item, options);
    });
    this.setState({ files }, () => resolve(this.selectedFile));
  });

  addTab = (file) => new Promise((resolve, reject) => {
    if (this.state.tabbedKeys.includes(file.key)) {
      resolve(file);
      return;
    }
    const tabbedKeys = this.state.tabbedKeys.concat(file.key);
    this.setState({ tabbedKeys }, () => resolve(file));
  });

  closeTab = (file) => new Promise((resolve, reject) => {
    const tabbedKeys = this.state.tabbedKeys.filter(key => key !== file.key);
    if (this.state.selectedKey !== file.key) {
      this.setState({ tabbedKeys }, () => resolve(file));
    } else {
      const selectedKey = tabbedKeys[0] || null;
      this.setState({ selectedKey, tabbedKeys }, () => resolve(file));
    }
  });

  inspection = (newFile, reject) => {
    const { files } = this.state;
    if (files.some(file => file.name === newFile.name && file.key !== newFile.key)) {
      // file.name should be unique
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

  handleEditorOptionChange = (change) => {
    const editorOptions = Object.assign({}, this.state.editorOptions, change);
    this.setState({ editorOptions });
  };

  updatePalette = (change) => {
    const palette = Object.assign({}, this.props.palette, change);

    this.setState({ palette });
  };

  openFileDialog = () => console.error('openFileDialog has not be declared');
  handleFileDialog = (ref) => this.openFileDialog = ref.open;

  render() {
    const {
      files, tabbedKeys, selectedKey,
      dialogContent,
      primaryStyle,
      editorOptions,
      isPopout,
      reboot,
      palette,
    } = this.state;
    const { player, config } = this.props;

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
      <MuiThemeProvider muiTheme={getMuiTheme({ palette })}>
        <div style={{ backgroundColor: 'inherit' }}>
          <Dock config={config} align="right" style={primaryStyle}>
            <Sizer
              handleResize={this.handleResize}
              primaryWidth={primaryStyle.width}
              secondaryHeight={secondaryStyle.height}
            />
            <EditorPane
              selectedFile={this.selectedFile}
              tabbedFiles={this.tabbedFiles}
              addFile={this.addFile}
              updateFile={this.updateFile}
              selectFile={this.selectFile}
              closeTab={this.closeTab}
              handleRun={this.handleRun}
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
              palette={palette}
              updatePalette={this.updatePalette}
              style={{ flex: '0 0 auto' }}
            />
            <ResourcePane
              files={files}
              selectedFile={this.selectedFile}
              tabbedFiles={this.tabbedFiles}
              addFile={this.addFile}
              updateFile={this.updateFile}
              selectFile={this.selectFile}
              closeTab={this.closeTab}
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
          <FileDialog ref={this.handleFileDialog} />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default DragDropContext(HTML5Backend)(Main);
