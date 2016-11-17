import React, { Component, PropTypes } from 'react';
import ReactCodeMirror from 'react-codemirror';
import { transparent, grey100 } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';

import CodeMirror from 'codemirror';
import 'codemirror/mode/meta';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';


import '../js/codemirror-hint-extension';

const AlreadySetSymbol = Symbol('AlreadySetSymbol');

const getStyles = (props, context, state) => {
  const {
    options: {
      tabVisibility,
      darkness,
    },
    gutterMarginWidth,
  } = props;
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
        border-color: ${palette.borderColor};
        background-color: ${palette.canvasColor};
        filter: invert(${darkness ? 100 : 0}%);
        padding-left: ${gutterMarginWidth}px;
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
    `,
  }
};

export default class Editor extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired,
    gutterMarginWidth: PropTypes.number,
  };

  static defaultProps = {
    gutterMarginWidth: 0,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    CssScopeId: ('just-a-scope-' + Math.random()).replace('.', '')
  };

  handleCodemirror = (ref) => {
    if (!ref) return;
    if (!ref[AlreadySetSymbol]) {
      const cm = ref.getCodeMirror();
      this.showHint(cm);
      ref[AlreadySetSymbol] = true;
    }
  }

  showHint(cm) {
    const { getFiles } = this.props;

    cm.on('change', (_cm, change) => {
      if (change.origin === 'setValue' || change.origin === 'complete') return;
      const token = cm.getTokenAt(cm.getCursor());
      cm.showHint({ completeSingle: false, files: getFiles() });
    });
  }

  render() {
    const {
      file,
      onChange,
    } = this.props;
    const { CssScopeId } = this.state;

    const {
      codemirror,
    } = getStyles(this.props, this.context, this.state);

    const options = Object.assign({
      lineNumbers: true,
      mode: CodeMirror.findModeByMIME(file.type).mode,
      indentUnit: this.props.options.indentUnit4 ? 4 : 2,
      indentWithTabs: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      keyMap: 'sublime',
      readOnly: file.options.isReadOnly,
    }, this.props.options);

    return (
      <div id={CssScopeId}>
        <style>{codemirror}</style>
        <ReactCodeMirror
          ref={this.handleCodemirror}
          value={file.text}
          onChange={onChange}
          options={options}
        />
      </div>
    );
  }
}
