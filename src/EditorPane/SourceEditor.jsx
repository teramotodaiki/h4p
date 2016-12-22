import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import { red50, red500 } from 'material-ui/styles/colors';


import { SizerWidth } from '../Monitor/';
import DragTypes from '../utils/dragTypes';
import Editor from './Editor';
import SnippetPane from './SnippetPane';
import SaveProgress from './SaveProgress';


const DELAY_TIME = 3000;

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
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isOver || nextProps.isOver) {
      return false;
    }
    return true;
  }

  handleChange = (text) => {
    if (!this.start) {
      return;
    }
    const babelrc = this.props.getConfig('babelrc');
    const completed = () => {
      this.props.onChange(text)
        .then((file) => file.babel(babelrc))
        .catch((err) => this.selectThis());
    };
    this.start(completed);
  };

  selectThis() {
    this.props.selectTab(this.props.tab);
  }

  render() {
    const {
      file,
      getConfig,
      findFile,

      connectDropTarget,
    } = this.props;
    const {
      showHint,
    } = this.state;

    const {
      root,
      error,
      editorContainer,
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
      <SaveProgress
        time={DELAY_TIME}
        startRef={(ref) => (this.start = ref)}
        forceRef={(ref) => (this.force = ref)}
      />
      {connectDropTarget(
        <div style={editorContainer}>
          <Editor {...props} />
        </div>
      )}
      {showHint ? (
        <SnippetPane
          snippets={snippets}
          findFile={findFile}
        />
      ) : null}
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
