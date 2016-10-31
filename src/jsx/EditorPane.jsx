import React, { PropTypes, Component } from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';


import EditorMenu from './EditorMenu';
import ChromeTab, { ChromeTabContent } from '../ChromeTab/';
import Preview from './Preview';
import { makeFromType } from '../js/files';
import { AddDialog } from '../FileDialog/';
import Editor from './Editor';
import ShotFrame from './ShotFrame';

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
      paddingBottom: 10,
      paddingLeft: spacing.desktopGutterLess,
      marginRight: spacing.desktopGutterMore,
      marginBottom: -10,
      marginLeft: SizerWidth,
      overflowX: 'scroll',
      overflowY: 'hidden',
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
    updateFile: PropTypes.func.isRequired,
    selectFile: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
    editorOptions: PropTypes.object.isRequired,
    handleEditorOptionChange: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    portPostMessage: PropTypes.func.isRequired,
    shot: PropTypes.object.isRequired,
    updateShot: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  handleAdd = () => {
    const { openFileDialog, addFile } = this.props;
    openFileDialog(AddDialog)
      .then(seed => makeFromType('text/javascript', seed))
      .then(file => addFile(file));
  };

  handleShot = () => {
    const { portPostMessage, shot } = this.props;
    if (portPostMessage) {
      portPostMessage({ query: 'shot', value: shot.text });
    }
  };

  render() {
    const {
      files, selectedFile, tabbedFiles,
      updateFile, selectFile, closeTab,
      handleRun,
      editorOptions,
      handleEditorOptionChange,
      openFileDialog,
      localization,
      shot,
      updateShot,
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
        editorOptions={editorOptions}
        handleEditorOptionChange={handleEditorOptionChange}
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
            options={editorOptions}
            getFiles={() => files}
            onChange={(text) => updateFile(file, { text })}
            gutterMarginWidth={SizerWidth}
          />
        ) : (
          <Preview file={file} />
        )}
        </ChromeTabContent>
      ))}
      {tabbedFiles.length === 0 ? (
        <ShotFrame onShot={this.handleShot}>
          <Editor
            file={shot}
            options={editorOptions}
            getFiles={() => files}
            onChange={(text) => updateShot({ text })}
          />
        </ShotFrame>
      ): null}
      </div>
      <FloatingActionButton secondary
        style={button}
        onClick={this.handleAdd}
      >
        <ContentAdd />
      </FloatingActionButton>
    </div>
    );
  }
}
