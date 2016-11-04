import React, { PropTypes, Component } from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { transform } from 'babel-standalone';


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
    options: PropTypes.object.isRequired,
    handleOptionChange: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    portPostMessage: PropTypes.func.isRequired,
    shot: PropTypes.object,
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

  handleAddShot = () => {
    const { addFile } = this.props;

    makeFromType('text/javascript', {
      name: '.shot',
      text: '',
    })
    .then(file => addFile(file));
  };

  handleShot = () => {
    const { portPostMessage, shot } = this.props;
    if (shot && portPostMessage) {
      const text = transform(shot.text, { presets: ['es2015', 'stage-0'] }).code;
      const value = Object.assign({}, shot, { text });
      portPostMessage({ query: 'shot', value });
    }
  };

  render() {
    const {
      files, selectedFile, tabbedFiles,
      updateFile, selectFile, closeTab,
      handleRun,
      options,
      handleOptionChange,
      openFileDialog,
      localization,
      shot,
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
        {shot ? (
          <Editor
            file={shot}
            options={options}
            getFiles={() => files}
            onChange={(text) => updateFile(shot, { text })}
          />
        ) : (
          <IconButton
            onTouchTap={this.handleAddShot}
          >
            <ContentAdd />
          </IconButton>
        )}
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
