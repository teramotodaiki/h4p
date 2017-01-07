import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import FlatButton from 'material-ui/FlatButton';
import { red50, red500 } from 'material-ui/styles/colors';
import HardwareKeyboardBackspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import ContentSave from 'material-ui/svg-icons/content/save';


import { SizerWidth } from '../Monitor/';
import DragTypes from '../utils/dragTypes';
import Editor from './Editor';
import SnippetPane from './SnippetPane';
import CreditBar from './CreditBar';


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
      borderStyle: 'double none double solid',
      borderLeftWidth: SizerWidth,
      backgroundColor: red50,
      color: red500,
      fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
    },
    editorContainer: {
      flex: '1 1 auto',
      position: 'relative',
    },
    menuBar: {
      display: 'flex',
      paddingLeft: SizerWidth,
      backgroundColor: palette.canvasColor,
      borderBottom: `1px solid ${palette.borderColor}`,
    },
    barButton: {
      padding: 0,
      height: '1.6rem',
      lineHeight: '1.6rem',
    },
    barButtonLabel: {
      fontSize: '.5rem',
    },
  };
};

class SourceEditor extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    tab: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired,
    gutterMarginWidth: PropTypes.number,
    handleRun: PropTypes.func.isRequired,
    closeSelectedTab: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
    getConfig: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    reboot: PropTypes.bool.isRequired,
    localization: PropTypes.object.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    gutterMarginWidth: SizerWidth,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    showHint: !this.props.file.is('json'),
    hasHistory: false,
    hasChanged: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isOver || nextProps.isOver) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.reboot && nextProps.reboot) {
      if (this.state.hasChanged) {
        this.handleSave();
      }
    }
  }

  handleSave = () => {
    if (!this.codemirror) {
      return;
    }
    const text = this.codemirror.getValue('\n');
    const babelrc = this.props.getConfig('babelrc');

    Promise.resolve()
      .then(() => this.setState({
        hasChanged: false,
      }))
      .then(() => this.props.onChange(text))
      .then((file) => file.babel(babelrc))
      .catch((err) => this.props.selectTab(this.props.tab));
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

  render() {
    const {
      file,
      getConfig,
      findFile,
      localization,

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
    } = getStyle(this.props, this.context);

    const snippets = getConfig('snippets')(file);

    const props = Object.assign({}, this.props, {
      codemirrorRef: (ref) => (this.codemirror = ref),
      onChange: this.handleChange,
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
      </div>
      {connectDropTarget(
        <div style={editorContainer}>
          <Editor {...props} />
        </div>
      )}
      {showHint ? (
        <SnippetPane
          snippets={snippets}
          findFile={findFile}
          localization={localization}
        />
      ) : null}
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
  drop(props, monitor, component) {
    if (monitor.getDropResult() || !component.codemirror) {
      return;
    }
    const { snippet } = monitor.getItem();
    const { codemirror } = component;

    const { x, y } = monitor.getClientOffset();
    const pos = codemirror.coordsChar({ left: x, top: y });

    snippet.hint(codemirror, { from: pos, to: pos }, snippet);

    return {};
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
});

export default DropTarget(DragTypes.Snippet, spec, collect)(SourceEditor);
