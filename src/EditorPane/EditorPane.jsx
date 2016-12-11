import React, { PropTypes, Component } from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';


import { SourceFile } from '../File/';
import EditorMenu from './EditorMenu';
import ChromeTab, { ChromeTabContent } from '../ChromeTab/';
import Preview from './Preview';
import { AddDialog } from '../FileDialog/';
import Editor from './Editor';
import Readme from './Readme';

const SizerWidth = 24;

const getStyles = (props, context) => {
  const { palette, spacing } = context.muiTheme;

  return {
    root: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      overflow: 'hidden',
    },
    tabContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      height: 32,
      paddingTop: spacing.desktopGutterMini,
      paddingRight: spacing.desktopGutterLess,
      paddingBottom: 10,
      paddingLeft: spacing.desktopGutterLess,
      marginRight: spacing.desktopGutterMore,
      marginBottom: -10,
      marginLeft: SizerWidth,
      overflow: 'hidden',
      zIndex: 10,
    },
    tabContentContainer: {
      flex: '1 1 auto',
      position: 'relative',
    },
    button: {
      position: 'absolute',
      right: 23,
      bottom: 23,
      zIndex: 1000,
    },
  };
};

export default class EditorPane extends Component {

  static propTypes = {
    selectedFile: PropTypes.object,
    files: PropTypes.array.isRequired,
    tabs: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    portPostMessage: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired,
    isShrinked: PropTypes.bool.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    showReadme: true,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.isResizing) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.tabs !== nextProps.tabs) {
      const showReadme = nextProps.tabs.length === 0;
      this.setState({ showReadme });
    }
  }

  handleAdd = () => {
    const { openFileDialog, addFile } = this.props;
    openFileDialog(AddDialog)
      .then(seed => new SourceFile(seed))
      .then(file => addFile(file));
  };

  handleShot = (text) => {
    const { portPostMessage, getConfig } = this.props;
    if (text && portPostMessage) {
      SourceFile.shot(text).babel(getConfig('babelrc'))
      .then((file) => portPostMessage({ query: 'shot', value: file.serialize() }));
    }
  };

  handleReadmeShow = (showReadme) => {
    this.setState({ showReadme });
  };

  handleSelectTab = (tab) => {
    this.props.selectTab(tab);
    this.handleReadmeShow(false);
  };

  render() {
    if (this.props.isShrinked) {
      return null;
    }

    const {
      files, selectedFile, tabs,
      putFile, selectTab, closeTab,
      handleRun,
      openFileDialog,
      localization,
      findFile,
      getConfig, setConfig,
    } = this.props;

    const {
      showReadme,
    } = this.state;

    const {
      root,
      tabContainer,
      tabContentContainer,
      button,
    } = getStyles(this.props, this.context);
    const { prepareStyles } = this.context.muiTheme;

    const tabbedFiles = tabs.map((tab) => tab.file);

    return (
    <div style={prepareStyles(root)}>
      <EditorMenu
        localization={localization}
        getConfig={getConfig}
        setConfig={setConfig}
      />
      <div style={prepareStyles(tabContainer)}>
      {tabs.map((tab) => (
        <ChromeTab
          key={tab.key}
          tab={tab}
          isSelected={tab.isSelected}
          tabbedFiles={tabbedFiles}
          handleSelect={this.handleSelectTab}
          handleClose={closeTab}
          handleRun={handleRun}
        />
      ))}
      </div>
      <div style={tabContentContainer}>
      {tabs.map((tab) => (
        <ChromeTabContent key={tab.key} show={tab.isSelected}>
        {tab.renderContent({
          getFiles: () => files,
          onChange: (text) => putFile(file, file.set({ text })),
          gutterMarginWidth: SizerWidth,
          handleRun,
          closeSelectedTab: () => closeTab(selectedFile),
          isSelected: tab.file === selectedFile,
          getConfig,
          findFile,
          localization,
          onShot: this.handleShot,
          selectTab,
        })}
        </ChromeTabContent>
      ))}
      </div>
      {tabs.length > 0 ? (
        <FloatingActionButton secondary
          style={button}
          onClick={this.handleAdd}
        >
          <ContentAdd />
        </FloatingActionButton>
      ) : null}
    </div>
    );
  }
}
