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
import Monitor, { MonitorTypes, maxByPriority } from '../Monitor/';
import Menu from '../Menu/';
import ReadmePane from '../ReadmePane/';
import SnippetPane from '../SnippetPane/';
import EnvPane from '../EnvPane/';
import Sizer from './Sizer';
import FileDialog, { SaveDialog, RenameDialog, DeleteDialog } from '../FileDialog/';
import DragTypes from '../utils/dragTypes';
import { Tab } from '../ChromeTab/';
import {
  MonitorCard,
  PaletteCard,
} from '../Cards/';

const DOWNLOAD_ENABLED = typeof document.createElement('a').download === 'string';

const getStyle = (props, state, palette) => {
  const { isResizing } = state;
  const shrinkLeft = parseInt(props.rootStyle.width, 10) - state.monitorWidth < 200;
  const shrinkRight = state.monitorWidth < 100;

  return {

    shrinkLeft,
    shrinkRight,

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
      flex: shrinkLeft ? '0 0 auto' : '1 1 auto',
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
      width: shrinkRight ? 0 : state.monitorWidth,
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
    reboot: false,
    href: '',

    tabs: [],

    localization: getLocalization(...(
      navigator.languages || [navigator.language]
    )),
    port: null,
    coreString: null,

    monitorType: MonitorTypes.Default,
  };

  get rootWidth() {
    return parseInt(this.props.rootStyle.width, 10);
  }

  get rootHeight() {
    return parseInt(this.props.rootStyle.height, 10);
  }

  findFile = (name, multiple = false) => {
    const { files } = this.state;
    if (typeof name === 'string') {
      name = name.replace(/^(\.\/|\/)*/, '');
    }
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

    const monitorType = this.state.monitorType === MonitorTypes.Default ?
      MonitorTypes.None : this.state.monitorType;

    const found = tabs.find((item) => item.is(tab));
    if (found) {
      const replace = found.select(true);
      this.setState({
        tabs: tabs.map((item) => item === found ? replace : item),
        monitorType,
      }, () => resolve(replace));
    } else {
      if (!tab.isSelected) tab = tab.select(true);
      this.setState({
        tabs: tabs.concat(tab),
        monitorType,
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

  handleTogglePopout = () => {
    const isPopout = this.state.monitorType === MonitorTypes.Popout;
    this.setState({
      reboot: !isPopout,
      monitorType: isPopout ?
        MonitorTypes.None : MonitorTypes.Popout,
    });
  };

  handleToggleTinyScreen = () => {
    const isCard = this.state.monitorType === MonitorTypes.Card;
    this.setState({
      reboot: true,
      monitorType: isCard ?
        MonitorTypes.Default : MonitorTypes.Card,
    });
  };

  setLocation = ({ href = '' }) => {
    this.setState({
      reboot: true,
      monitorType: maxByPriority(this.state.monitorType, MonitorTypes.Default),
      href,
    });
  };

  setResizing = (isResizing) => {
    return this.setState({ isResizing })
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
      reboot,
      localization,
      port,
    } = this.state;
    const showMonitor = this.state.monitorType === MonitorTypes.Default;

    const styles = getStyle(this.props, this.state, this.getConfig('palette'));

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
      show: this.state.monitorType !== MonitorTypes.Default,
      tabs,
      selectTab: this.selectTab,
      closeTab: this.closeTab,
      setLocation: this.setLocation,
      openFileDialog: this.openFileDialog,
      port,
      reboot,
      isShrinked: isShrinked(
        this.rootWidth - monitorWidth,
        this.rootHeight
      ),
    };

    const monitorProps = {
      show: showMonitor,
      isPopout: this.state.monitorType === MonitorTypes.Popout,
      monitorWidth,
      monitorHeight: this.rootHeight,
      reboot,
      portRef: (port) => this.setState({ port }),
      togglePopout: this.handleTogglePopout,
      coreString: this.state.coreString,
      saveAs: this.saveAs,
      href: this.state.href,
      setLocation: this.setLocation,
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
      isPopout: this.state.monitorType === MonitorTypes.Popout,
      monitorWidth,
      monitorHeight,
      coreString: this.state.coreString,
      saveAs: this.saveAs,
      showMonitor,
    };

    const readmeProps = {
      selectTab: this.selectTab,
      port: this.state.port,
    };

    const snippetProps = {
      tabs,
    };

    const envProps = {
      selectTab: this.selectTab,
    };

    const monitorCardProps = {
      rootWidth: this.rootWidth,
      monitorWidth,
      toggleTinyScreen: this.handleToggleTinyScreen,
      show: this.state.monitorType === MonitorTypes.Card,
      isPopout: false,
      reboot,
      portRef: (port) => this.setState({ port }),
      coreString: this.state.coreString,
      saveAs: this.saveAs,
      href: this.state.href,
      setLocation: this.setLocation,
    };

    return (
      <MuiThemeProvider muiTheme={getCustomTheme({ palette: this.getConfig('palette') })}>
      {connectDropTarget(
        <div style={styles.root}>
          <div style={styles.dropCover}></div>
          <div style={styles.left}>
            <div style={styles.scroll}>
              <ReadmePane {...commonProps} {...readmeProps} />
              <SnippetPane {...commonProps} {...snippetProps} />
              <EnvPane {...commonProps} {...envProps} />
              <PaletteCard {...commonProps} />
              <MonitorCard {...commonProps} {...monitorCardProps} />
              <Hierarchy {...commonProps} {...hierarchyProps} />
            </div>
          </div>
          <Sizer
            monitorWidth={monitorWidth}
            monitorHeight={monitorHeight}
            onSizer={this.setResizing}
            showMonitor={showMonitor}
          />
          <div style={styles.right}>
            <Monitor {...commonProps} {...monitorProps} />
            <EditorPane {...commonProps} {...editorPaneProps} />
            <Menu {...commonProps} {...menuProps} />
          {showMonitor ? (
            <IconButton
              style={{
                position: 'absolute',
                right: 0,
                zIndex: 1000
              }}
              onTouchTap={() => this.setState({ monitorType: MonitorTypes.None })}
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
