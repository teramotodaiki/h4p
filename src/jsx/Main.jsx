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
import EditorPane, { Readme } from '../EditorPane/';
import Hierarchy from '../Hierarchy/';
import Monitor, { Sizer, Menu } from '../Monitor/';
import FileDialog, { SaveDialog, RenameDialog, DeleteDialog } from '../FileDialog/';
import DragTypes from '../utils/dragTypes';
import { Tab } from '../ChromeTab/';

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
    const { localization } = this.state;

    if (!this.findFile('README.md')) {
      this.addFile(
        new SourceFile({
          type: 'text/x-markdown',
          name: 'README.md',
          text: localization.readme.text,
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

    if (!this.state.tabs.length) {
      this.selectTab(new Tab({
        getFile: () => this.findFile('README.md'),
        component: Readme,
      }));
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

  deleteFile = (file) => new Promise((resolve, reject) => {
    const files = this.state.files.filter((item) => item.key !== file.key);
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
      }, () => resolve(replace));
    } else {
      if (!tab.isSelected) tab = tab.select(true);
      this.setState({
        tabs: tabs.concat(tab),
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

  saveAs = (file) => new Promise((resolve, reject) => {
    const a = document.createElement('a');

    if (typeof a.download === 'string') {
      a.download = file.name;
      a.href = file.blobURL || URL.createObjectURL(
        new Blob([file.text], { type: file.type })
      );
      const event = document.createEvent("MouseEvents");
      event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(event);
      return Promise.resolve();
    } else {
      // for Safari/IE11/Edge
      return this.openFileDialog(SaveDialog, { content: file });
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
      dropCover,
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
      monitorWidth,
      monitorHeight,
      reboot,
      rootHeight: this.rootHeight,
      isPopout: isPopout,
      portRef: (port) => this.setState({ port }),
      openFileDialog: this.openFileDialog,
      togglePopout: this.handleTogglePopout,
      handleRun: this.handleRun,
      setLocalization: this.setLocalization,
      onSizer: (isResizing) => this.setState({ isResizing }),
      inlineScriptId: this.props.inlineScriptId,
      saveAs: this.saveAs,
    };

    const hierarchyProps = {
      tabs,
      deleteFile: this.deleteFile,
      selectTab: this.selectTab,
      closeTab: this.closeTab,
      openFileDialog: this.openFileDialog,
      saveAs: this.saveAs,
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
