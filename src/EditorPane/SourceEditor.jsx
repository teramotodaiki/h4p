import React, { PureComponent, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';
import { red50, red500 } from 'material-ui/styles/colors';
import HardwareKeyboardBackspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import ContentSave from 'material-ui/svg-icons/content/save';
import { Pos } from 'codemirror';


import DragTypes from '../utils/dragTypes';
import Editor from './Editor';
import CreditBar from './CreditBar';
import PlayMenu from './PlayMenu';


const getStyle = (props, context) => {
  const {
    palette,
  } = context.muiTheme;

  return {
    root: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    error: {
      flex: '0 1 auto',
      margin: 0,
      padding: 8,
      borderStyle: 'double',
      backgroundColor: red50,
      color: red500,
      fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
      overflow: 'scroll',
    },
    editorContainer: {
      flex: '1 1 auto',
      position: 'relative',
    },
    menuBar: {
      display: 'flex',
      backgroundColor: palette.canvasColor,
      borderBottom: `1px solid ${palette.primary1Color}`,
    },
    barButton: {
      padding: 0,
      height: '1.6rem',
      lineHeight: '1.6rem',
    },
    barButtonLabel: {
      fontSize: '.5rem',
    },
    progressColor: palette.primary1Color,
    progress: {
      borderRadius: 0,
    },
  };
};

class SourceEditor extends PureComponent {

  static propTypes = {
    file: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    getConfig: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    reboot: PropTypes.bool.isRequired,
    localization: PropTypes.object.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    closeSelectedTab: PropTypes.func.isRequired,
    selectTabFromFile: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    showHint: !this.props.file.is('json'),
    hasHistory: false,
    hasChanged: false,
    loading: false,
    snippets: [],

    prevDoc: null,
    previewFrom: null,
    previewTo: null,
  };

  componentWillMount() {
    this.setState({
      snippets: this.props.getConfig('snippets')(this.props.file),
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isOver !== nextProps.isOver && this.codemirror) {
      if (nextProps.isOver) {
        // enter
        this.setState({
          prevDoc: this.codemirror.getDoc().copy(true),
          previewFrom: null,
          previewTo: null,
        });
      } else {
        // Leave
        this.setState({
          prevDoc: null,
          previewFrom: null,
          previewTo: null,
        });
      }
    }

    this.setState({
      snippets: nextProps.getConfig('snippets')(nextProps.file),
    });
  }

  componentDidMount() {
    if (this.codemirror) {
      this.codemirror.on('change', this.handleChange);
      this.codemirror.clearHistory();
    }
  }

  handleSave = async () => {
    if (!this.codemirror) {
      return;
    }
    const text = this.codemirror.getValue('\n');
    const babelrc = this.props.getConfig('babelrc');

    if (text === this.props.file.text) {
      return;
    }

    this.setState({
      hasChanged: false,
      loading: true,
    });

    const file = await this.props.putFile(
      this.props.file,
      this.props.file.set({ text })
    );

    try {
      await file.babel(babelrc);
    } catch (e) {
      console.log('select', file);
      await this.props.selectTabFromFile(file);
      throw e;
    } finally {
      this.setState({
        loading: false,
      });
    }

  };

  handleUndo = () => {
    if (!this.codemirror) {
      return;
    }

    this.codemirror.undo();
    this.handleChange();
  };

  handleChange = () => {
    if (!this.codemirror) {
      return;
    }

    this.setState({
      hasHistory: this.codemirror.historySize().undo > 0,
      hasChanged: this.codemirror.getValue('\n') !== this.props.file.text,
    });
  };

  handleReload = () => {
    this.setLocation({
      href: this.props.href,
    });
  };

  setLocation = async ({ href }) => {

    await this.handleSave();

    return this.props.setLocation({ href });

  };

  handleCodemirror = (ref) => {
    if (!ref) {
      return;
    }
    this.codemirror = ref;
  };


  _queue = null; // Single queue of async function to invoke later
  _processing = false; // State of process
  async handlePreview(...args) {
    if (this._processing) {
      this._queue = () => this.handlePreview(...args);
      return;
    }

    this._processing = true;
    await this.renderPreview(...args);
    this._processing = false;

    const next = this._queue;
    this._queue = null;
    if (next) next();

  };

  async renderPreview(snippet, pos) {
    const {
      prevDoc,
      previewFrom,
      previewTo,
    } = this.state;

    if (
      previewFrom  && pos.line >= previewFrom.line - 1 &&
      previewTo    && pos.line <= previewTo.line ||
      !prevDoc || !this.codemirror
    ) {

      // Abort
      return new Promise((resolve, reject) => {
        requestAnimationFrame(resolve);
      });

    }

    // Update
    this.codemirror.setValue(prevDoc.getValue('\n'));

    if (previewFrom && previewTo && pos.line >= previewTo.line) {
      // Except preview area
      pos.line -= previewTo.line - previewFrom.line + 1;
    }

    const self = { from: pos, to: pos, asset: true };

    const { from, to } = snippet.hint(this.codemirror, self, snippet);

    this.codemirror.markText(from, to, {
      css: 'opacity: 0.5;',
    });

    this.setState({
      previewFrom: from,
      previewTo: to,
    });

    await new Promise((resolve, reject) => setTimeout(resolve, 500));
  }

  render() {
    const {
      file,
      getConfig,
      findFile,
      localization,
      href,

      connectDropTarget,
    } = this.props;
    const {
      showHint,
    } = this.state;

    const {
      root,
      error,
      editorContainer,
      menuBar,
      barButton,
      barButtonLabel,
      progressColor,
      progress,
    } = getStyle(this.props, this.context);

    const snippets = getConfig('snippets')(file);

    const props = Object.assign({}, this.props, {
      codemirrorRef: this.handleCodemirror,
      onChange: undefined,
      handleRun: this.handleReload,
      showHint,
    });

    return (
      <div style={root}>
      {file.error ? (
        <pre style={error}>{file.error.message}</pre>
      ) : null}
        <div style={menuBar}>
          <FlatButton
            label={localization.editor.undo}
            disabled={!this.state.hasHistory}
            style={barButton}
            labelStyle={barButtonLabel}
            icon={<HardwareKeyboardBackspace />}
            onTouchTap={this.handleUndo}
          />
          <FlatButton
            label={localization.editor.save}
            disabled={!this.state.hasChanged}
            style={barButton}
            labelStyle={barButtonLabel}
            icon={<ContentSave />}
            onTouchTap={this.handleSave}
          />
          <div style={{ flex: '1 1 auto' }}></div>
          <PlayMenu
            getFiles={this.props.getFiles}
            setLocation={this.setLocation}
            href={this.props.href}
            localization={this.props.localization}
          />
        </div>
      {this.state.loading ? (
        <LinearProgress
          color={progressColor}
          style={progress}
        />
      ) : null}
      {connectDropTarget(
        <div style={editorContainer}>
          <Editor
            {...props}
            snippets={this.state.snippets}
          />
        </div>
      )}
        <CreditBar
          file={file}
          openFileDialog={this.props.openFileDialog}
          putFile={this.props.putFile}
          localization={localization}
          getFiles={this.props.getFiles}
        />
      </div>
    );
  }
}

const spec = {
  hover(props, monitor, component) {
    if (!component.codemirror) return;

    const { codemirror } = component;
    const { snippet } = monitor.getItem();

    const { x, y } = monitor.getClientOffset();
    const { line, ch } = codemirror.coordsChar({ left: x, top: y + 10 });

    component.handlePreview(snippet, new Pos(line - 1, ch));
  },
  drop(props, monitor, component) {
    if (monitor.getDropResult() || !component.codemirror) return;

    const { snippet } = monitor.getItem();
    const { codemirror, state } = component;

    const pos = new Pos(state.previewFrom.line - 1, 0);

    codemirror.swapDoc(state.prevDoc);
    snippet.hint(codemirror, { from: pos, to: pos, asset: true }, snippet);

    component.handleSave();

    return {};
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
});

export default DropTarget(DragTypes.Snippet, spec, collect)(SourceEditor);
