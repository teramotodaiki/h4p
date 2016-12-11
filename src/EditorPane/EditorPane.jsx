import React, { PropTypes, Component } from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';


import { SourceFile } from '../File/';
import EditorMenu from './EditorMenu';
import ChromeTab, { ChromeTabContent } from '../ChromeTab/';
import Preview from './Preview';
import { AddDialog } from '../FileDialog/';
import { SizerWidth } from '../Monitor/';
import MarkdownMenu from './MarkdownMenu';


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
      paddingLeft: 10 + spacing.desktopGutterMore,
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

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.isResizing) {
      return false;
    }
    return true;
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

  render() {
    if (this.props.isShrinked) {
      return null;
    }

    const {
      files, tabs,
      putFile, selectTab, closeTab,
      handleRun,
      openFileDialog,
      localization,
      findFile,
      getConfig, setConfig,
    } = this.props;

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
      <MarkdownMenu
        files={files}
        tabs={tabs}
        selectTab={selectTab}
      />
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
          handleSelect={selectTab}
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
          onChange: (text) => putFile(tab.file, tab.file.set({ text })),
          gutterMarginWidth: SizerWidth,
          handleRun,
          closeSelectedTab: () => tab.isSelected && closeTab(tab),
          isSelected: tab.isSelected,
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
