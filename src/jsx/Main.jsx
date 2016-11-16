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
import getCustomTheme, { defaultPalette } from '../js/getCustomTheme';
import Dock from './Dock';
import Menu from './Menu';
import EditorPane from './EditorPane';
import Hierarchy from '../Hierarchy/';
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

    files: this.props.config.files,
    isPopout: false,
    reboot: false,

    selectedKey: null,
    tabbedKeys: [],

    localization: getLocalization(...(
      navigator.languages || [navigator.language]
    )),
    portPostMessage: () => {},

  };

  get selectedFile() {
    const { files, selectedKey } = this.state;
    return files.find(file => file.key === selectedKey);
  }

  get tabbedFiles() {
    const { files, tabbedKeys } = this.state;
    return tabbedKeys.map(key => files.find(file => key === file.key));
  }

  get shot() {
    return this.state.files.find(f => f.name === '.shot');
  }

  get options() {
    const defaultOptions = {
      unlimited: true,
      tabVisibility: false,
      darkness: false,
      lineWrapping: false,
      indentUnit4: false,
    };
    const file = this.state.files.find(f => f.name === '.options');
    return Object.assign({}, defaultOptions, file ? file.json : {});
  }

  get env() {
    const defaultEnv = {
      DEBUG: [true, 'boolean', 'A flag means test mode'],
      TITLE: ['My App', 'string', 'A name of this app'],
    };
    const file = this.state.files.find(f => f.name === '.env');
    return Object.assign({}, defaultEnv, file ? file.json : {});
  }

  get palette() {
    const file = this.state.files.find(f => f.name === '.palette');
    return Object.assign({}, defaultPalette, file ? file.json : {});
  }

  get babelrc() {
    const defaultBabelrc = {
      presets: ['es2015'],
    };
    const file = this.state.files.find(f => f.name === '.babelrc');
    return Object.assign({}, defaultBabelrc, file ? file.json : {});
  }

  get readme() {
    const file = this.state.files.find((file) => file.name === 'README.md');
    return file ? file.text : '# README';
  }

  componentDidMount() {
    const { files } = this.props.config;
    const tabbedKeys = files
      .filter(file => file.options.isEntryPoint)
      .map(file => file.key);
    const selectedKey = tabbedKeys[0] || null;

    if (!files.find((file) => file.name === '.babelrc')) {
      makeFromType('application/json', {
        name: '.babelrc',
        text: JSON.stringify({ presets: ['es2015'] }, null, '\t')
      })
      .then((file) => this.addFile(file));
    }

    if (!files.find((file) => file.name === 'README.md')) {
      makeFromType('text/x-markdown', {
        name: 'README.md',
        text: this.readme,
      })
      .then((file) => this.addFile(file));
    }

    if (this.options.unlimited === false) {
      this.setState({ reboot: true, secondaryHeight: 40 });
      return;
    }

    document.title = this.env.TITLE[0];

    this.setState({
      reboot: true,
      tabbedKeys, selectedKey,
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
    if (files.some(file =>
      file.moduleName &&
      file.moduleName === newFile.moduleName &&
      file.key !== newFile.key
    )) {
      // file.moduleName should be unique
      return true;
    }
    if (newFile.moduleName === 'env') {
      // 'env' is reserved name
      return true;
    }
    if (newFile.moduleName.indexOf('.') === 0) {
      return true;
    }
    return false;
  };

  handleResize = (primaryWidth, secondaryHeight) => {
    if (!this.options.unlimited) {
      secondaryHeight = 40;
    }
    this.setState({ primaryWidth, secondaryHeight });
  };

  handleRun = () => {
    this.setState({ reboot: true });
  };

  handleTogglePopout = () => {
    const isPopout = !this.state.isPopout;
    this.setState({ isPopout, reboot: true });
  };

  handleOptionChange = (change) => {
    const indent = ' '.repeat(this.options.indentUnit4 ? 4 : 2);
    return Promise.resolve()
      .then(() => {
        const optionFile = this.state.files.find(f => f.name === '.options');

        if (!optionFile) {
          const json = Object.assign({}, this.options, change);
          return makeFromType('application/json', {
            name: '.options',
            text: JSON.stringify(json, null, indent),
            options: { isReadOnly: true }
          })
          .then((file) => this.addFile(file));
        }
        const text = JSON.stringify(
          Object.assign(JSON.parse(optionFile.text), change),
          null, indent
        );
        const json = JSON.parse(text);
        return this.updateFile(optionFile, { json, text });
      })
      .then((file) => {

        if ('unlimited' in change) {
          this.setState({
            secondaryHeight: file.json.unlimited ? 400 : 40,
            tabbedKeys: [],
          });
        }
        return Promise.resolve(file.json);
      });
  };

  handlePaletteChange = (change) => {
    const indent = ' '.repeat(this.options.indentUnit4 ? 4 : 2);
    const paletteFile = this.state.files.find(f => f.name === '.palette');

    if (!paletteFile) {
      const json = Object.assign({}, this.palette, change);
      return makeFromType('application/json', {
        name: '.palette',
        text: JSON.stringify(json, null, indent),
        options: { isReadOnly: true }
      })
      .then((file) => this.addFile(file))
      .then((file) => file.json);
    }
    const text = JSON.stringify(
      Object.assign(JSON.parse(paletteFile.text), change),
      null, indent
    );
    const json = JSON.parse(text);
    return this.updateFile(paletteFile, { json, text })
      .then((file) => file.json);
  };

  handleEnvChange = (change) => {
    const indent = ' '.repeat(this.options.indentUnit4 ? 4 : 2);
    const envFile = this.state.files.find(f => f.name === '.env');

    if (!envFile) {
      const json = Object.assign({}, this.env, change);
      return makeFromType('application/json', {
        name: '.env',
        text: JSON.stringify(json, null, indent),
        options: { isReadOnly: true }
      })
      .then((file) => this.addFile(file))
      .then((file) => file.json);
    }
    const text = JSON.stringify(
      Object.assign(JSON.parse(envFile.text), change),
      null, indent
    );
    const json = JSON.parse(text);

    if (json.TITLE) {
      document.title = json.TITLE[0];
    }

    return this.updateFile(envFile, { json, text })
      .then((file) => file.json);
  };

  setLocalization = (localization) => {
    this.setState({ localization });
  };

  openFileDialog = () => console.error('openFileDialog has not be declared');
  handleFileDialog = (ref) => this.openFileDialog = ref.open;

  handlePort = (ref) => {
    const portPostMessage = (data) => ref.postMessage(data);
    this.setState({ portPostMessage });
  };

  render() {
    const {
      files, tabbedKeys, selectedKey,
      dialogContent,
      primaryWidth, secondaryHeight,
      isPopout,
      reboot,
      localization,
      portPostMessage,
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
      <MuiThemeProvider muiTheme={getCustomTheme({ palette: this.palette })}>
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
              options={this.options}
              handleOptionChange={this.handleOptionChange}
              openFileDialog={this.openFileDialog}
              localization={localization}
              portPostMessage={portPostMessage}
              shot={this.shot}
              babelrc={this.babelrc}
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
              palette={this.palette}
              env={this.env}
              updatePalette={this.handlePaletteChange}
              updateEnv={this.handleEnvChange}
              options={this.options}
              localization={localization}
              setLocalization={this.setLocalization}
              availableLanguages={this.availableLanguages}
            />
            <Hierarchy
              files={files}
              selectedFile={this.selectedFile}
              tabbedFiles={this.tabbedFiles}
              addFile={this.addFile}
              updateFile={this.updateFile}
              selectFile={this.selectFile}
              closeTab={this.closeTab}
              openFileDialog={this.openFileDialog}
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
            env={this.env}
            handlePopoutClose={this.handleTogglePopout}
            portRef={this.handlePort}
            babelrc={this.babelrc}
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
