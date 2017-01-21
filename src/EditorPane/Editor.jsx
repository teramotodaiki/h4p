import React, { PureComponent, PropTypes } from 'react';
import ReactCodeMirror from 'react-codemirror';
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
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/keymap/sublime';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/scroll/simplescrollbars.css';
import 'codemirror/addon/fold/foldgutter.css';

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
    snippets: PropTypes.array.isRequired,
    showHint: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onChange: () => {},
    handleRun: () => {},
    getFiles: () => [],
    closeSelectedTab: () => {},
    isCared: false,
    codemirrorRef: () => {},
    snippets: [],
    showHint: true,
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
      cm.showHint({
        completeSingle: false,
        files: getFiles(),
        snippets: this.props.snippets,
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
          "indent_with_tabs": true,
          "indent_inner_html": true,
          "extra_liners": [],
        })
      );
    } else if (file.is('css')) {
      cm.setValue(
        beautify.css(cm.getValue(), {
          "indent_with_tabs": true,
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
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      foldOptions: {
      rangeFinder: CodeMirror.fold.auto,
        widget: "✧⟣❃⟢✧",
        minFoldSize: 1,
        scanUp: false,
      },
      dragDrop: false,
    }, getConfig('options'));

    return (
      <ReactCodeMirror preserveScrollPosition
        ref={this.handleCodemirror}
        value={file.text}
        onChange={onChange}
        options={options}
      />
    );
  }
}
