import React, { PureComponent, PropTypes } from 'react';
import ReactCodeMirror from 'react-codemirror';
import { transparent, grey100 } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import beautify from 'js-beautify';

import CodeMirror from 'codemirror';
import 'codemirror/mode/meta';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/scroll/simplescrollbars.js';
import 'codemirror/keymap/sublime';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/scroll/simplescrollbars.css';

import glslMode from 'glsl-editor/glsl';
glslMode(CodeMirror);
CodeMirror.modeInfo.push({
  name: "glsl",
  mime: "text/x-glsl",
  mode: "glsl",
});

import './codemirror-hint-extension';
import '../css/codemirror-extension.css';

import excessiveCare from './excessiveCare';

const AlreadySetSymbol = Symbol('AlreadySetSymbol');

export const MimeTypes = {
  'text/javascript': '.js',
  'text/x-markdown': '.md',
  'application/json': '.json',
  'text/html': '.html',
  'text/css': '.css',
  'text/plane': '',
  'text/x-glsl': '.sort',
};

export const FileEditorMap = new WeakMap();

const getStyles = (props, context, state) => {
  const {
  } = props;
  const {
    tabVisibility,
    darkness,
  } = props.getConfig('options');
  const {
    palette,
  } = context.muiTheme;
  const { CssScopeId } = state;

  return {
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
        border-color: ${palette.primary1Color};
        background-color: ${palette.canvasColor};
        filter: invert(${darkness ? 100 : 0}%);
      }
      #${CssScopeId} .CodeMirror-gutter:first-child {
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
      #${CssScopeId} .CodeMirror-dialog {
        background-color: ${palette.canvasColor};
      }
    `,
  }
};


export default class Editor extends PureComponent {

  static propTypes = {
    file: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
    closeSelectedTab: PropTypes.func.isRequired,
    isCared: PropTypes.bool.isRequired,
    getConfig: PropTypes.func.isRequired,
    codemirrorRef: PropTypes.func.isRequired,
    completes: PropTypes.array.isRequired,
    showHint: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onChange: () => {},
    handleRun: () => {},
    getFiles: () => [],
    closeSelectedTab: () => {},
    isCared: false,
    codemirrorRef: () => {},
    completes: [],
    showHint: true,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    CssScopeId: ('just-a-scope-' + Math.random()).replace('.', '')
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.file === nextProps.file) {
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    if (FileEditorMap.has(prevProps.file)) {
      const editor = FileEditorMap.get(prevProps.file);
      FileEditorMap.set(this.props.file, editor);
    }
  }

  handleCodemirror = (ref) => {
    if (!ref) return;
    if (!ref[AlreadySetSymbol]) {
      const cm = ref.getCodeMirror();
      this.props.codemirrorRef(cm);
      this.showHint(cm);
      ref[AlreadySetSymbol] = true;
      FileEditorMap.set(this.props.file, cm);
    }
  }

  showHint(cm) {
    if (!this.props.showHint) {
      return;
    }
    const { getFiles, isCared, getConfig } = this.props;

    cm.on('change', (_cm, change) => {
      if (change.origin === 'setValue' || change.origin === 'complete') return;
      const cursor = cm.getCursor();
      cm.scrollIntoView(cursor);
      const token = cm.getTokenAt(cursor);
      const snippets = getConfig('snippets')(this.props.file);
      cm.showHint({
        completeSingle: false,
        files: getFiles(),
        snippets,
        completes: this.props.completes,
      });
    });

    if (isCared) {
      cm.on('beforeChange', excessiveCare);
    }
  }

  beautify = (cm) => {
    const { file } = this.props;
    if (file.is('javascript')) {
      cm.setValue(
        beautify(cm.getValue(), {
          "indent_with_tabs": true,
          "end_with_newline": true,
        })
      );
    } else if (file.is('html')) {
      cm.setValue(
        beautify.html(cm.getValue(), {
          "indent_inner_html": true,
          "extra_liners": [],
        })
      );
    } else if (file.is('css')) {
      cm.setValue(
        beautify.css(cm.getValue(), {

        })
      );
    }
  };

  render() {
    const {
      file,
      onChange,
      handleRun,
      closeSelectedTab,
      getConfig,
    } = this.props;
    const { CssScopeId } = this.state;

    const {
      codemirror,
    } = getStyles(this.props, this.context, this.state);

    const meta = CodeMirror.findModeByMIME(file.type);

    const options = Object.assign({
      lineNumbers: true,
      mode: meta && meta.mode,
      indentUnit: getConfig('options').indentUnit4 ? 4 : 2,
      indentWithTabs: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      keyMap: 'sublime',
      readOnly: file.options.isReadOnly,
      extraKeys: {
        'Ctrl-Enter': handleRun,
        'Cmd-Enter': handleRun,
        'Ctrl-W': closeSelectedTab,
        'Cmd-W': closeSelectedTab,
        'Ctrl-Alt-B': this.beautify,
      },
      scrollbarStyle: 'simple',
    }, getConfig('options'));

    return (
      <div id={CssScopeId}>
        <style>{codemirror}</style>
        <ReactCodeMirror preserveScrollPosition
          ref={this.handleCodemirror}
          value={file.text}
          onChange={onChange}
          options={options}
        />
      </div>
    );
  }
}
