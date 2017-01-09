import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';

import { DropTarget } from 'react-dnd';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconButton from 'material-ui/IconButton';
import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import { faintBlack } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


import { BinaryFile, SourceFile, configs } from '../File/';
import getLocalization from '../localization/';
import getCustomTheme from '../js/getCustomTheme';
import EditorPane, { Readme } from '../EditorPane/';
import Hierarchy from '../Hierarchy/';
import Monitor from '../Monitor/';
import Menu from '../Menu/';
import ReadmePane from '../ReadmePane/';
import SnippetPane from '../EditorPane/SnippetPane';
import EnvPane from '../EnvPane/';
import PalettePane from '../PalettePane/';
import Sizer from './Sizer';
import FileDialog, { SaveDialog, RenameDialog, DeleteDialog } from '../FileDialog/';
import DragTypes from '../utils/dragTypes';
import { Tab } from '../ChromeTab/';

const DOWNLOAD_ENABLED = typeof document.createElement('a').download === 'string';

const getStyle = (props, state, palette) => {
  const { isResizing } = state;

  return {
    root: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'stretch',
      backgroundColor: palette.backgroundColor,
      overflow: 'hidden',
    },
    left: {
      flex: '1 1 auto',
      width: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    scroll: {
      overflow: 'scroll',
    },
    right: {
      flex: '0 0 auto',
      boxSizing: 'border-box',
      width: state.monitorWidth,
      height: '100%',
      paddingBottom: 4,
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
    inlineScriptId: PropTypes.string,

    connectDropTarget: PropTypes.func.isRequired,
  };

  state = {
    monitorWidth: this.rootWidth / 2,
    monitorHeight: this.rootHeight,
    isResizing: false,

    files: this.props.files,
    isPopout: false,
    reboot: false,

    tabs: [],

    localization: getLocalization(...(
      navigator.languages || [navigator.language]
    )),
    port: null,
    coreString: null,

    showMonitor: true,
  };

  get rootWidth() {
    return parseInt(this.props.rootStyle.width, 10);
  }

  get rootHeight() {
    return parseInt(this.props.rootStyle.height, 10);
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
    const {
      inlineScriptId,
    } = this.props;
    const { localization } = this.state;



    document.title = this.getConfig('env').TITLE[0];

    if (inlineScriptId) {
      const inlineLib = document.getElementById(inlineScriptId);
      if (inlineLib) {
        this.setState({
          coreString: inlineLib.textContent,
        });
      } else {
        throw `Missing script element has id="${inlineScriptId}"`;
      }
    } else {
      fetch(CORE_CDN_URL, { mode: 'cors' })
        .then(response => {
          if (!response.ok) {
            throw response.error ? response.error() : response.statusText;
          }
          return response.text();
        })
        .then((coreString) => this.setState({ coreString }));
    }

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
    const files = this.state.files
      .map((item) => item.key === prevFile.key ? nextFile : item);
    this._configs.clear();
    this.setState({ files }, () => resolve(nextFile));
  });

  deleteFile = (...targets) => new Promise((resolve, reject) => {
    const keys = targets.map((item) => item.key);
    const files = this.state.files.filter((item) => !keys.includes(item.key));
    this.setState({ files }, () => resolve());
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
        multiple ? bundle(files) : files.json
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

  selectTab = (tab) => new Promise((resolve, reject) => {
    const tabs = this.state.tabs.map((item) => {
      if (item.isSelected) return item.select(false);
      return item;
    });

    const found = tabs.find((item) => item.is(tab));
    if (found) {
      const replace = found.select(true);
      this.setState({
        tabs: tabs.map((item) => item === found ? replace : item),
        showMonitor: false,
      }, () => resolve(replace));
    } else {
      if (!tab.isSelected) tab = tab.select(true);
      this.setState({
        tabs: tabs.concat(tab),
        showMonitor: false,
      }, () => resolve(tab));
    }
  });

  closeTab = (tab) => new Promise((resolve, reject) => {
    const tabs = this.state.tabs.filter((item) => item.key !== tab.key);
    if (tab.isSelected && tabs.length > 0) {
      tabs[0] = tabs[0].select(true);
    }
    this.setState({ tabs }, () => resolve());
  });

  saveAs = (...files) => {
    if (DOWNLOAD_ENABLED) {

      files.forEach((file) => {
        const a = document.createElement('a');
        const event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

        a.download = file.name;
        a.href = file.blobURL || URL.createObjectURL(
          new Blob([file.text], { type: file.type })
        );
        a.dispatchEvent(event)

        if (a.href !== file.blobURL) {
          URL.revokeObjectURL(a.href);
        }
      });

      return Promise.resolve();
    } else {
      // for Safari/IE11/Edge
      return this.openFileDialog(SaveDialog, { content: files });
    }
  };

  inspection = (newFile, reject) => {
    const { files } = this.state;
    if (files.some(file =>
      !file.options.isTrashed &&
      file.key !== newFile.key &&
      file.name === newFile.name
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
    this.setState({
      reboot: true,
      showMonitor: !this.state.isPopout,
    });
  };

  handleTogglePopout = () => {
    this.setState({
      reboot: !this.state.isPopout,
      isPopout: !this.state.isPopout,
      showMonitor: false,
    });
  };

  setLocalization = (localization) => {
    this.setState({ localization });
  };

  openFileDialog = () => console.error('openFileDialog has not be declared');
  handleFileDialog = (ref) => this.openFileDialog = ref.open;

  render() {
    const {
      connectDropTarget,
    } = this.props;

    const {
      files, tabs,
      dialogContent,
      monitorWidth, monitorHeight, isResizing,
      isPopout,
      reboot,
      localization,
      port,
    } = this.state;

    const {
      root,
      left,
      scroll,
      dropCover,
      right,
    } = getStyle(this.props, this.state, this.getConfig('palette'));

    const commonProps = {
      files,
      isResizing,
      localization,
      getConfig: this.getConfig,
      setConfig: this.setConfig,
      findFile: this.findFile,
      addFile: this.addFile,
      putFile: this.putFile,
    };

    const isShrinked = (width, height) => width < 200 || height < 40;

    const editorPaneProps = {
      showMonitor: this.state.showMonitor,
      tabs,
      selectTab: this.selectTab,
      closeTab: this.closeTab,
      handleRun: this.handleRun,
      openFileDialog: this.openFileDialog,
      port,
      reboot,
      isShrinked: isShrinked(
        this.rootWidth - monitorWidth,
        this.rootHeight
      ),
    };

    const monitorProps = {
      showMonitor: this.state.showMonitor,
      monitorWidth,
      monitorHeight: this.rootHeight,
      reboot,
      isPopout,
      portRef: (port) => this.setState({ port }),
      togglePopout: this.handleTogglePopout,
      handleRun: this.handleRun,
      coreString: this.state.coreString,
      saveAs: this.saveAs,
    };

    const hierarchyProps = {
      tabs,
      deleteFile: this.deleteFile,
      selectTab: this.selectTab,
      closeTab: this.closeTab,
      openFileDialog: this.openFileDialog,
      saveAs: this.saveAs,
    };

    const menuProps = {
      togglePopout: this.handleTogglePopout,
      setLocalization: this.setLocalization,
      openFileDialog: this.openFileDialog,
      isPopout,
      monitorWidth,
      monitorHeight,
      coreString: this.state.coreString,
      saveAs: this.saveAs,
      showMonitor: this.state.showMonitor,
    };

    const readmeProps = {
      selectTab: this.selectTab,
      port: this.state.port,
    };

    const snippetProps = {
      tabs,
    };

    return (
      <MuiThemeProvider muiTheme={getCustomTheme({ palette: this.getConfig('palette') })}>
      {connectDropTarget(
        <div style={root}>
          <div style={dropCover}></div>
          <div style={left}>
            <div style={scroll}>
              <ReadmePane {...commonProps} {...readmeProps} />
              <SnippetPane {...commonProps} {...snippetProps} />
              <EnvPane {...commonProps} />
              <PalettePane {...commonProps} />
              <Hierarchy {...commonProps} {...hierarchyProps} />
            </div>
          </div>
          <Sizer
            monitorWidth={monitorWidth}
            monitorHeight={monitorHeight}
            onSizer={(isResizing) => this.setState({ isResizing })}
            showMonitor={this.state.showMonitor}
          />
          <div style={right}>
            <Monitor {...commonProps} {...monitorProps} />
            <EditorPane {...commonProps} {...editorPaneProps} />
            <Menu {...commonProps} {...menuProps} />
          {this.state.showMonitor ? (
            <IconButton
              style={{
                position: 'absolute',
                right: 0,
                zIndex: 1000
              }}
              onTouchTap={() => this.setState({ showMonitor: false })}
            >
              <ActionSwapHoriz color="white" />
            </IconButton>
          ) : null}
          </div>
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
      init.width - offset.x,
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
        init.width - offset.x,
        init.height + offset.y
      );
    }
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
});

export default DropTarget(DragTypes.Sizer, spec, collect)(Main);
