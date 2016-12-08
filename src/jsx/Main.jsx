import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';

import { DropTarget } from 'react-dnd';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { faintBlack } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


import { BinaryFile, SourceFile, configs } from '../File/';
import getLocalization from '../localization/';
import getCustomTheme from '../js/getCustomTheme';
import EditorPane from '../EditorPane/';
import Hierarchy from '../Hierarchy/';
import Monitor, { Sizer, Menu } from '../Monitor/';
import FileDialog, { SaveDialog, RenameDialog, DeleteDialog } from '../FileDialog/';
import DragTypes from '../utils/dragTypes';

const getStyle = (props, state, palette) => {
  const { isResizing } = state;

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
    dropCover: {
      position: 'absolute',
      opacity: isResizing ? 1 : 0,
      width: isResizing ? '100%' : 0,
      height: isResizing ? '100%' : 0,
      backgroundColor: faintBlack,
      zIndex: 2000,
      transition: transitions.easeOut(null, 'opacity'),
    },
  };
};

class Main extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    rootStyle: PropTypes.object.isRequired,
    provider: PropTypes.object,

    connectDropTarget: PropTypes.func.isRequired,
  };

  state = {
    monitorWidth: this.rootWidth / 2,
    monitorHeight: this.rootHeight,
    isResizing: false,

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

  get readme() {
    const file = this.findFile('README.md');
    return file ? file.text : this.state.localization.readme.text;
  }

  findFile = (name, multiple = false) => {
    const { files } = this.state;
    const pred = typeof name === 'function' ? name :
      (file) => (
        !file.options.isTrashed &&
        (file.name === name || file.moduleName === name)
      );

    return multiple ? files.filter(pred) : files.find(pred);
  };

  componentDidMount() {
    const { files } = this.props;

    if (!this.findFile('README.md')) {
      this.addFile(
        new SourceFile({
          type: 'text/x-markdown',
          name: 'README.md',
          text: this.readme,
        })
      );
    }

    document.title = this.getConfig('env').TITLE[0];

    this.setState({ reboot: true });
  }

  componentDidUpdate() {
    if (this.state.reboot) {
      this.setState({ reboot: false });
    }

    document.title = this.getConfig('env').TITLE[0];
  }

  addFile = (file) => new Promise((resolve, reject) => {
    const files = this.state.files.concat(file);
    if (this.inspection(file)) {
      resolve(file);
      return;
    }
    this.setState({ files }, () => resolve(file));
    this._configs.clear();
  });

  putFile = (prevFile, nextFile) => new Promise((resolve, reject) => {
    if (this.inspection(nextFile)) {
      resolve(prevFile);
      return;
    }
    const files = this.state.files.map((item) => item === prevFile ? nextFile : item);
    this.setState({ files }, () => resolve(nextFile));
    this._configs.clear();
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

  _configs = new Map();
  getConfig = (key) => {
    if (this._configs.has(key)) {
      return this._configs.get(key);
    } else {
      const { test, defaultValue, multiple, bundle } = configs.get(key);
      const files = this.findFile((file) => (
        !file.options.isTrashed && test.test(file.name)
      ), multiple);

      const value = files ? (
        multiple ? bundle(files) : file.json
      ) : defaultValue;
      this._configs.set(key, value);
      return value;
    }
  };

  setConfig = (key, config) => {
    this._configs.delete(key);

    const { test, defaultName } = configs.get(key);
    const configFile = this.findFile((file) => (
      !file.options.isTrashed && test.test(file.name)
    ), false);

    const indent = '    ';
    const text = JSON.stringify(config, null, indent);
    if (configFile) {
      return this.putFile(configFile, configFile.set({ text }));
    } else {
      const newFile = new SourceFile({
        type: 'application/json',
        name: defaultName,
        text
      });
      return this.addFile(newFile);
    }
  };

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
      provider,
    } = this.props;

    const {
      files, tabbedKeys, selectedKey,
      dialogContent,
      monitorWidth, monitorHeight, isResizing,
      isPopout,
      reboot,
      localization,
      portPostMessage,
    } = this.state;

    const {
      root,
      left,
      dropCover,
    } = getStyle(this.props, this.state, this.getConfig('palette'));

    const commonProps = {
      files,
      isResizing,
      localization,
      getConfig: this.getConfig,
    };

    const isShrinked = (width, height) => width < 200 || height < 40;

    const editorPaneProps = {
      selectedFile: this.selectedFile,
      tabbedFiles: this.tabbedFiles,
      addFile: this.addFile,
      putFile: this.putFile,
      selectFile: this.selectFile,
      closeTab: this.closeTab,
      handleRun: this.handleRun,
      openFileDialog: this.openFileDialog,
      localization: localization,
      portPostMessage: portPostMessage,
      readme: this.readme,
      findFile: this.findFile,
      isShrinked: isShrinked(
        this.rootWidth - monitorWidth,
        this.rootHeight
      ),
      setConfig: this.setConfig,
    };

    const monitorProps = {
      monitorWidth,
      monitorHeight,
      rootHeight: this.rootHeight,
      isPopout: isPopout,
      reboot: reboot,
      portRef: this.handlePort,
      openFileDialog: this.openFileDialog,
      togglePopout: this.handleTogglePopout,
      handleRun: this.handleRun,
      localization: localization,
      setLocalization: this.setLocalization,
      canDeploy: !!(provider && provider.publishUrl),
      provider,
      onSizer: (isResizing) => this.setState({ isResizing }),
    };

    const hierarchyProps = {
      selectedFile: this.selectedFile,
      tabbedFiles: this.tabbedFiles,
      addFile: this.addFile,
      putFile: this.putFile,
      deleteFile: this.deleteFile,
      selectFile: this.selectFile,
      closeTab: this.closeTab,
      openFileDialog: this.openFileDialog,
      isShrinked: isShrinked(
        monitorWidth,
        this.rootHeight - monitorHeight
      ),
    };

    return (
      <MuiThemeProvider muiTheme={getCustomTheme({ palette: this.getConfig('palette') })}>
      {connectDropTarget(
        <div style={root}>
          <div style={dropCover}></div>
          <div style={left}>
            <Monitor {...commonProps} {...monitorProps} />
            <Hierarchy {...commonProps} {...hierarchyProps} />
          </div>
          <EditorPane {...commonProps} {...editorPaneProps} />
          <FileDialog
            ref={this.handleFileDialog}
            localization={localization}
            getConfig={this.getConfig}
            setConfig={this.setConfig}
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
});

export default DropTarget(DragTypes.Sizer, spec, collect)(Main);
