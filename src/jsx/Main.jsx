import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';

import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


import getLocalization from '../localization/';
import { makeFromFile, makeFromType } from '../js/files';
import { makeEnv } from '../js/env';
import getCustomTheme from '../js/getCustomTheme';
import Dock from './Dock';
import Postmate from '../js/LoosePostmate';
import Menu from './Menu';
import EditorPane from './EditorPane';
import ResourcePane from './ResourcePane';
import ScreenPane from './ScreenPane';
import Sizer from './Sizer';

import FileDialog, { SaveDialog, RenameDialog, DeleteDialog } from '../FileDialog/';

class Main extends Component {

  static propTypes = {
    player: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired
  };

  state = {
    primaryWidth: 400,
    secondaryHeight: 400,

    files: [],
    isPopout: false,
    reboot: false,

    selectedKey: null,
    tabbedKeys: [],

    editorOptions: {
      tabVisibility: false,
      darkness: false,
    },

    palette: {},
    env: [],
    localization: getLocalization(...(
      navigator.languages || [navigator.language]
    )),

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
    const { player, config: { files, env, palette } } = this.props;

    const tabbedKeys = files
      .filter(file => file.options.isEntryPoint)
      .map(file => file.key);
    const selectedKey = tabbedKeys[0] || null;
    this.setState({
      reboot: true,
      files, tabbedKeys, selectedKey,
      env, palette
    });
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
    const { files } = this.state;
    const selectedKey = file.key;
    if (this.state.tabbedKeys.includes(selectedKey)) {
      this.setState({ selectedKey }, () => resolve(file));
    } else if (files.some(item => item === file)) {
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
    if (files.some(file => file.moduleName === newFile.moduleName && file.key !== newFile.key)) {
      // file.moduleName should be unique
      return true;
    }
    if (newFile.moduleName === 'env') {
      // 'env' is reserved name
      return true;
    }
    return false;
  };

  handleResize = (primaryWidth, secondaryHeight) => {
    this.setState({ primaryWidth, secondaryHeight });
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

  updatePalette = (change) => new Promise((resolve, reject) => {
    const palette = Object.assign({}, this.state.palette, change);

    this.setState({ palette }, () => resolve(palette));
  });

  updateEnv = (change, index = -1) => new Promise((resolve, reject) => {
    const merged = index in this.state.env ?
      this.state.env.map((item, i) => i === index ? change : item) :
      this.state.env.concat(change);
    const env = merged.filter(e => e);

    this.setState({ env }, () => resolve(env));
  });

  setLocalization = (localization) => {
    this.setState({ localization });
  };

  openFileDialog = () => console.error('openFileDialog has not be declared');
  handleFileDialog = (ref) => this.openFileDialog = ref.open;

  render() {
    const {
      files, tabbedKeys, selectedKey,
      dialogContent,
      primaryWidth, secondaryHeight,
      editorOptions,
      isPopout,
      reboot,
      palette, env,
      localization,
    } = this.state;
    const { player, config } = this.props;

    const primaryDockStyle = {
      width: primaryWidth,
      zIndex: 2,
    }

    const secondaryDockStyle = {
      height: secondaryHeight,
      paddingRight: primaryWidth,
      zIndex: 1,
    };

    return (
      <MuiThemeProvider muiTheme={getCustomTheme({ palette })}>
        <div style={{ backgroundColor: 'inherit' }}>
          <Dock config={config} style={primaryDockStyle}>
            <Sizer
              handleResize={this.handleResize}
              primaryWidth={primaryWidth}
              secondaryHeight={secondaryHeight}
            />
            <EditorPane
              selectedFile={this.selectedFile}
              tabbedFiles={this.tabbedFiles}
              files={files}
              addFile={this.addFile}
              updateFile={this.updateFile}
              selectFile={this.selectFile}
              closeTab={this.closeTab}
              handleRun={this.handleRun}
              editorOptions={editorOptions}
              handleEditorOptionChange={this.handleEditorOptionChange}
              openFileDialog={this.openFileDialog}
              localization={localization}
            />
          </Dock>
          <Dock config={config} style={secondaryDockStyle}>
            <Menu
              player={player}
              files={files}
              isPopout={isPopout}
              handleRun={this.handleRun}
              openFileDialog={this.openFileDialog}
              handleTogglePopout={this.handleTogglePopout}
              palette={palette}
              env={env}
              updatePalette={this.updatePalette}
              updateEnv={this.updateEnv}
              localization={localization}
              setLocalization={this.setLocalization}
              availableLanguages={this.availableLanguages}
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
            primaryWidth={primaryWidth}
            secondaryHeight={secondaryHeight}
            files={files}
            isPopout={isPopout}
            reboot={reboot}
            env={env}
            handlePopoutClose={this.handleTogglePopout}
          />
          <FileDialog
            ref={this.handleFileDialog}
            localization={localization}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default DragDropContext(HTML5Backend)(Main);
