import React, { PropTypes, Component } from 'react';
import ReactCodeMirror from 'react-codemirror';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { transparent, fullWhite, grey100 } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';


import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';

import '../js/codemirror-hint-extension';
import EditorMenu from './EditorMenu';
import ChromeTab, { ChromeTabContent } from '../ChromeTab/';
import Preview from './Preview';
import { makeFromType } from '../js/files';
import { AddDialog } from '../FileDialog/';

const CssScopeId = ('just-a-scope-' + Math.random()).replace('.', '');
const AlreadySetSymbol = Symbol('set');

const getStyles = (props, context) => {
  const {
    tabVisibility,
    darkness,
  } = props.editorOptions;
  const { palette, spacing } = context.muiTheme;

  const tabHeight = 32;
  const sizerWidth = 24;

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
      marginLeft: sizerWidth,
      overflowX: 'scroll',
      overflowY: 'hidden',
      zIndex: 10,
    },
    tabContentContainer: {
      flex: '1 1 auto',
      position: 'relative',
      borderColor: transparent,
      borderStyle: 'solid',
      borderWidth: 0,
      borderLeftWidth: sizerWidth,
      backgroundColor: palette.canvasColor,
    },
    button: {
      position: 'absolute',
      right: 23,
      bottom: 23,
      zIndex: 1000,
    },
    hint: {
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
    },
    codemirror: `
      #${CssScopeId} textarea {
        font-size: 16px; // In smartphone, will not scale automatically
      }
      #${CssScopeId} .ReactCodeMirror {
        position: absolute;
        width: 100%;
        height: 100%;
        filter:
          invert(${darkness ? 100 : 0}%);
        background-color: ${grey100};
        transition: ${transitions.easeOut()};
      }
      #${CssScopeId} .CodeMirror {
        font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
        width: 100%;
        height: 100%;
        background-color: ${transparent};
      }
      #${CssScopeId} .CodeMirror-line {
        filter:
          contrast(${darkness ? 20 : 100}%)
          saturate(${darkness ? 200 : 100}%);
      }
      #${CssScopeId} .CodeMirror-linenumber {
        color: ${palette.secondaryTextColor};
        filter: invert(${darkness ? 100 : 0}%);
      }
      #${CssScopeId} .CodeMirror-gutters {
        border-color: ${palette.borderColor};
        background-color: ${palette.canvasColor};
        filter: invert(${darkness ? 100 : 0}%);
      }
      #${CssScopeId} .CodeMirror-matchingbracket {
        color: ${palette.primary1Color};
      	border-bottom: 1px solid ${palette.primary1Color};
      }
      #${CssScopeId} .cm-tab:before {
        content: '••••';
        position: absolute;
        color: ${palette.primary3Color};
        border-left: 1px solid ${palette.primary3Color};
        visibility: ${
          tabVisibility ? 'visible' : 'hidden'
        };
      }
      #${CssScopeId} .CodeMirror-hint-snippet {
        font-style: italic;
      }

    `,
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
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  handleCodemirror (ref, file) {
    if (!ref) return;
    if (!ref[AlreadySetSymbol]) {
      const cm = ref.getCodeMirror();
      this.showHint(cm);
      ref[AlreadySetSymbol] = true;
    }
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
      localization,
    } = this.props;

    const {
      root,
      tabContainer,
      tabContentContainer,
      button,
      hint,
      codemirror,
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
    <div style={prepareStyles(root)} id={CssScopeId}>
      <style>{codemirror}</style>
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
      <div style={prepareStyles(tabContentContainer)}>
      {tabbedFiles.map(file => (
        <ChromeTabContent key={file.key} show={file === selectedFile}>
        {file.isText ? (
          <ReactCodeMirror
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
      <FloatingActionButton secondary
        style={button}
        onClick={this.handleAdd}
      >
        <ContentAdd />
      </FloatingActionButton>
      <div style={hint} ref={(div) => this.hints = div}></div>
    </div>
    );
  }
}
