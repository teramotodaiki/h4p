import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';


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
    editorContainer: {
      flex: '1 1 auto',
      position: 'relative',
    },
  };
};

class SourceEditor extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired,
    gutterMarginWidth: PropTypes.number,
    handleRun: PropTypes.func.isRequired,
    closeSelectedTab: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
    getConfig: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    gutterMarginWidth: SizerWidth,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isOver || nextProps.isOver) {
      return false;
    }
    return true;
  }

  _timer = null;
  handleChange = (text) => {
    if (this.start) {
      this.start();
    }
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.props.onChange(text);
    }, DELAY_TIME);
  };

  render() {
    const {
      file,
      getConfig,
      findFile,

      connectDropTarget,
    } = this.props;

    const {
      root,
      editorContainer,
    } = getStyle(this.props, this.context);

    const snippets = getConfig('snippets')(file);

    const props = Object.assign({}, this.props, {
      codemirrorRef: (ref) => (this.codemirror = ref),
      onChange: this.handleChange,
    });

    return (
      <div style={root}>
      <SaveProgress
        time={DELAY_TIME}
        startRef={(ref) => (this.start = ref)}
      />
      {connectDropTarget(
        <div style={editorContainer}>
          <Editor {...props} />
        </div>
      )}
        <SnippetPane
          snippets={snippets}
          findFile={findFile}
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
