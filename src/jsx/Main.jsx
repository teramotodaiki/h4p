import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';

import { DropTarget } from 'react-dnd';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


import getLocalization from '../localization/';
import { makeFromFile, makeFromType } from '../js/files';
import getCustomTheme, { defaultPalette } from '../js/getCustomTheme';
import EditorPane from '../EditorPane/';
import Hierarchy from '../Hierarchy/';
import Monitor, { Sizer, Menu } from '../Monitor/';
import FileDialog, { SaveDialog, RenameDialog, DeleteDialog } from '../FileDialog/';
import DragTypes from '../utils/dragTypes';

const getStyle = (props, palette) => {
  return {
    root: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: palette.backgroundColor,
      overflow: 'hidden',
    },
    left: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  };
};

class Main extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    rootStyle: PropTypes.object.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired,
  };

  state = {
    monitorWidth: this.rootWidth / 2,
    monitorHeight: this.rootHeight,

    files: this.props.files,
    isPopout: false,
    reboot: false,

    selectedKey: null,
    tabbedKeys: [],

    localization: getLocalization(...(
      navigator.languages || [navigator.language]
    )),
    portPostMessage: () => {},
  };

  get rootWidth() {
    return parseInt(this.props.rootStyle.width, 10);
  }

  get rootHeight() {
    return parseInt(this.props.rootStyle.height, 10);
  }

  get selectedFile() {
    const { files, selectedKey } = this.state;
    return files.find(file => file.key === selectedKey);
  }

  get tabbedFiles() {
    const { files, tabbedKeys } = this.state;
    return tabbedKeys.map(key => files.find(file => key === file.key));
  }

  get options() {
    const defaultOptions = {
      unlimited: true,
      tabVisibility: false,
      darkness: false,
      lineWrapping: false,
      indentUnit4: false,
    };
    const file = this.findFile('.options');
    return Object.assign({}, defaultOptions, file ? file.json : {});
  }

  get env() {
    const defaultEnv = {
      DEBUG: [true, 'boolean', 'A flag means test mode'],
      TITLE: ['My App', 'string', 'A name of this app'],
    };
    const file = this.findFile('.env');
    return Object.assign({}, defaultEnv, file ? file.json : {});
  }

  get palette() {
    const file = this.findFile('.palette');
    return Object.assign({}, defaultPalette, file ? file.json : {});
  }

  get babelrc() {
    const defaultBabelrc = {
      presets: ['es2015'],
    };
    const file = this.findFile('.babelrc');
    return Object.assign({}, defaultBabelrc, file ? file.json : {});
  }

  get readme() {
    const file = this.findFile('README.md');
    return file ? file.text : this.state.localization.readme.text;
  }

  findFile = (name) => {
    return this.state.files.find((file) =>
      !file.options.isTrashed &&
      file.name === name
    );
  };

  componentDidMount() {
    const { files } = this.props;

    if (!this.findFile('.babelrc')) {
      makeFromType('application/json', {
        name: '.babelrc',
        text: JSON.stringify(this.babelrc, null, '\t')
      })
      .then((file) => this.addFile(file));
    }

    if (!this.findFile('README.md')) {
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

    this.setState({ reboot: true });
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
      !file.options.isTrashed &&
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

  resize = ((waitFlag = false) =>
  (monitorWidth, monitorHeight, forceFlag = false) => {
    monitorWidth = Math.max(0, Math.min(this.rootWidth, monitorWidth));
    monitorHeight = Math.max(0, Math.min(this.rootHeight, monitorHeight));
    if (
      waitFlag && !forceFlag ||
      monitorWidth === this.state.monitorWidth &&
      monitorHeight === this.state.monitorHeight
    ) {
      return;
    }
    this.setState({ monitorWidth, monitorHeight }, () => {
      setTimeout(() => (waitFlag = false), 400);
    });
    waitFlag = true;
  })();

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
        const optionFile = this.findFile('.options');

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
    const paletteFile = this.findFile('.palette');

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
    const envFile = this.findFile('.env');

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
      connectDropTarget,
      isResizing,
    } = this.props;

    const {
      files, tabbedKeys, selectedKey,
      dialogContent,
      monitorWidth, monitorHeight,
      isPopout,
      reboot,
      localization,
      portPostMessage,
    } = this.state;

    const { root, left } = getStyle(this.props, this.palette);

    const commonProps = {
      files,
      isResizing,
    };

    const isShrinked = (width, height) => width < 100 || height < 40;

    const editorPaneProps = {
      selectedFile: this.selectedFile,
      tabbedFiles: this.tabbedFiles,
      addFile: this.addFile,
      updateFile: this.updateFile,
      selectFile: this.selectFile,
      closeTab: this.closeTab,
      handleRun: this.handleRun,
      options: this.options,
      handleOptionChange: this.handleOptionChange,
      openFileDialog: this.openFileDialog,
      localization: localization,
      portPostMessage: portPostMessage,
      readme: this.readme,
      babelrc: this.babelrc,
      findFile: this.findFile,
      isShrinked: isShrinked(
        this.rootWidth - monitorWidth,
        this.rootHeight
      ),
    };

    const monitorProps = {
      monitorWidth,
      monitorHeight,
      rootHeight: this.rootHeight,
      isPopout: isPopout,
      reboot: reboot,
      env: this.env,
      palette: this.palette,
      portRef: this.handlePort,
      babelrc: this.babelrc,
      openFileDialog: this.openFileDialog,
      togglePopout: this.handleTogglePopout,
      handleRun: this.handleRun,
      updatePalette: this.handlePaletteChange,
      updateEnv: this.handleEnvChange,
      options: this.options,
      localization: localization,
      setLocalization: this.setLocalization,
    };

    const hierarchyProps = {
      selectedFile: this.selectedFile,
      tabbedFiles: this.tabbedFiles,
      addFile: this.addFile,
      updateFile: this.updateFile,
      selectFile: this.selectFile,
      closeTab: this.closeTab,
      openFileDialog: this.openFileDialog,
      isShrinked: isShrinked(
        this.rootWidth,
        this.rootHeight - monitorHeight
      ),
    };

    return (
      <MuiThemeProvider muiTheme={getCustomTheme({ palette: this.palette })}>
      {connectDropTarget(
        <div style={root}>
          <div style={left}>
            <Monitor {...commonProps} {...monitorProps} />
            <Hierarchy {...commonProps} {...hierarchyProps} />
          </div>
          <EditorPane {...commonProps} {...editorPaneProps} />
          <FileDialog
            ref={this.handleFileDialog}
            localization={localization}
          />
        </div>
      )}
      </MuiThemeProvider>
    );
  }
}

const spec = {
  drop(props, monitor, component) {
    const offset = monitor.getDifferenceFromInitialOffset();
    const init = monitor.getItem();
    component.resize(
      init.width + offset.x,
      init.height + offset.y,
      true
    );
    return {};
  },
  hover(props, monitor, component) {
    const offset = monitor.getDifferenceFromInitialOffset();
    if (offset) {
      const init = monitor.getItem();
      component.resize(
        init.width + offset.x,
        init.height + offset.y
      );
    }
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isResizing: monitor.isOver({ shallow: true }),
});

export default DropTarget(DragTypes.Sizer, spec, collect)(Main);
