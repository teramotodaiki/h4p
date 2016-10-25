import React, { PropTypes, Component } from 'react';
import ReactCodeMirror from 'react-codemirror';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';


import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';

import '../js/codemirror-hint-extension';
import EditorMenu from './EditorMenu';
import ChromeTabs, { ChromeTabContent } from './ChromeTabs/';
import Preview from './Preview';
import { makeFromType } from '../js/files';
import { AddDialog } from './FileDialog/';

const CODEMIRROR_HINT_CONTAINER = 'CodeMirror-hint_container';

const getStyles = (props, context) => {
  const { palette } = context.muiTheme;

  const sizerWidth = 24;

  return {
    root: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      overflow: 'hidden',
    },
    tabContentContainer: {
      flex: '1 1 auto',
      position: 'relative',
      borderColor: palette.canvasColor,
      borderStyle: 'solid',
      borderTopWidth: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderLeftWidth: sizerWidth,
      backgroundColor: palette.canvasColor,
    },
    button: {
      position: 'absolute',
      right: 23,
      bottom: 23,
      zIndex: 1000,
    }
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
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  handleCodemirror (ref, file) {
    if (!ref) return;
    const cm = ref.getCodeMirror();
    cm.setValue(file.text);
    this.showHint(cm);
  }

  showHint(cm) {
    const getFiles = () => this.props.files;
    cm.on('change', (_cm, change) => {
      if (change.origin === 'setValue' || change.origin === 'complete') return;
      const token = cm.getTokenAt(cm.getCursor());
      cm.showHint({ completeSingle: false, container: this.hints, files: getFiles() });
    });
  }

  handleAdd = () => {
    const { openFileDialog, addFile } = this.props;
    openFileDialog(AddDialog)
      .then(seed => makeFromType('text/javascript', seed))
      .then(file => addFile(file));
  };

  render() {
    const {
      selectedFile, tabbedFiles,
      updateFile, selectFile, closeTab,
      handleRun,
      editorOptions,
      handleEditorOptionChange,
      openFileDialog,
    } = this.props;

    const {
      root,
      tabContentContainer,
      button,
    } = getStyles(this.props, this.context);
    const { prepareStyles } = this.context.muiTheme;

    const options = (file) => Object.assign({
      lineNumbers: true,
      mode: 'javascript',
      indentUnit: 4,
      indentWithTabs: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      keyMap: 'sublime',
      readOnly: file.options.isReadOnly,
    }, editorOptions);

    return (
    <div style={prepareStyles(root)}>
      <EditorMenu
        editorOptions={editorOptions}
        handleEditorOptionChange={handleEditorOptionChange}
      />
      <ChromeTabs
        selectedFile={selectedFile}
        tabbedFiles={tabbedFiles}
        handleSelect={selectFile}
        handleClose={closeTab}
        handleRun={handleRun}
      />
      <div style={prepareStyles(tabContentContainer)}>
      {tabbedFiles.map(file => (
        <ChromeTabContent key={file.key} show={file === selectedFile}>
        {file.isText ? (
          <ReactCodeMirror
            className={options.tabVisibility ? 'ReactCodeMirror__tab-visible' : ''}
            ref={(ref) => this.handleCodemirror(ref, file)}
            value={file.text}
            onChange={(text) => updateFile(file, { text })}
            options={options(file)}
          />
        ) : (
          <Preview file={file} />
        )}
        </ChromeTabContent>
      ))}
      </div>
      <FloatingActionButton
        style={button}
        onClick={this.handleAdd}
      >
        <ContentAdd />
      </FloatingActionButton>
      <div className={CODEMIRROR_HINT_CONTAINER} ref={(div) => this.hints = div}></div>
    </div>
    );
  }
}
