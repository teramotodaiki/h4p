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
import babelWorker from '../workers/babel-worker';

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
    tabbedFiles: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    selectFile: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired,
    handleOptionChange: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    portPostMessage: PropTypes.func.isRequired,
    readme: PropTypes.string.isRequired,
    babelrc: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired,
    isShrinked: PropTypes.bool.isRequired,
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
    const { portPostMessage, babelrc } = this.props;
    if (text && portPostMessage) {
      Promise.resolve(SourceFile.shot(text))
      .then((file) => babelWorker(file, babelrc))
      .then((file) => portPostMessage({ query: 'shot', value: file.serialize() }));
    }
  };

  handleReadmeSelect = () => {
    const { findFile, tabbedFiles, selectFile } = this.props;
    const readme = findFile('README.md');

    if (readme && !tabbedFiles.includes(readme)) {
      selectFile(readme);
    }
  };

  render() {
    if (this.props.isShrinked) {
      return null;
    }

    const {
      files, selectedFile, tabbedFiles,
      putFile, selectFile, closeTab,
      handleRun,
      options,
      handleOptionChange,
      openFileDialog,
      localization,
      readme,
      findFile,
    } = this.props;

    const {
      root,
      tabContainer,
      tabContentContainer,
      button,
    } = getStyles(this.props, this.context);
    const { prepareStyles } = this.context.muiTheme;


    return (
    <div style={prepareStyles(root)}>
      <EditorMenu
        options={options}
        handleOptionChange={handleOptionChange}
        localization={localization}
      />
      <div style={prepareStyles(tabContainer)}>
      {tabbedFiles.map(file => (
        <ChromeTab
          key={file.key}
          file={file}
          isSelected={file === selectedFile}
          tabbedFiles={tabbedFiles}
          handleSelect={selectFile}
          handleClose={closeTab}
          handleRun={handleRun}
        />
      ))}
      </div>
      <div style={tabContentContainer}>
      {tabbedFiles.map(file => (
        <ChromeTabContent key={file.key} show={file === selectedFile}>
        {file.isText ? (
          <Editor
            file={file}
            options={options}
            getFiles={() => files}
            onChange={(text) => putFile(file, file.set({ text }))}
            gutterMarginWidth={SizerWidth}
            handleRun={handleRun}
            closeSelectedTab={() => closeTab(selectedFile)}
            isSelected={file === selectedFile}
          />
        ) : (
          <Preview file={file} />
        )}
        </ChromeTabContent>
      ))}
      <Readme
        options={options}
        readme={readme}
        localization={localization}
        onTouchTap={this.handleReadmeSelect}
        onShot={this.handleShot}
        findFile={findFile}
        selectFile={selectFile}
      />
      </div>
      {tabbedFiles.length > 0 ? (
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
