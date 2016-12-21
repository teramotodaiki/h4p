import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import Paper from 'material-ui/Paper';


import DragTypes from '../utils/dragTypes';

const TOUCH_START = 'touchstart' in document ? 'onTouchStart' : 'onMouseDown';
const TOUCH_END = 'touchend' in document ? 'onTouchEnd' : 'onMouseUp';

const getStyle = (props, context, state) => {
  const {
    isDragging,
  } = props;

  const {
    palette,
    spacing,
  } = context.muiTheme;

  const {
    code,
  } = state;

  const commonAlignment = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    wordWrap: 'break-word',
  };

  return {
    root: {
      position: 'relative',
      flex: '0 0 auto',
      boxSizing: 'border-box',
      width: '6rem',
      height: '6rem',
      padding: 8,
      zIndex: code ? 2 : 1,
    },
    container: Object.assign({
      width: '100%',
      height: '100%',
      cursor: 'move',
    }, commonAlignment),
    button: {
      width: '100%',
      height: '100%',
    },
    pre: {
      backgroundColor: palette.canvasColor,
    },
    left: commonAlignment,
    prefix: {
      textAlign: 'center',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      fontSize: '1rem',
      padding: '.5rem 0',
    },
    leftLabel: {
      textAlign: 'center',
      fontSize: '.5rem',
    },
    right: Object.assign({
      flex: '1 1 auto',
    }, commonAlignment),
    description: {
      fontSize: '1rem',
      maxWidth: 300,
    },
    rightLabel: {
      fontSize: '.5rem',
    },
    plane: {
      position: 'absolute',
      fontSize: '.5rem',
      right: 0,
      bottom: 0,
    },
  };
};

class SnippetButton extends Component {

  static propTypes = {
    snippet: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    code: false,
  };

  handleTouch = (event) => {
    const { snippet, findFile } = this.props;
    const {
      button,
      left,
      prefix,
      description,
      leftLabel,
      right,
      rightLabel,
      plane,
    } = getStyle(this.props, this.context, this.state);

    this.props.onSelect(event, (
      <Paper style={button}>
        <div style={left}>
          <span style={prefix}>{snippet.prefix}</span>
          <span style={leftLabel}>{snippet.renderLeftLabel(findFile)}</span>
        </div>
        <div style={right}>
          <span style={description}>{snippet.description}</span>
          <code style={rightLabel}>{snippet.renderRightLabel(findFile)}</code>
          <span style={plane}>{snippet.plane}</span>
        </div>
      </Paper>
    ));
  };

  render() {
    const {
      snippet,
      isDragging,
      findFile,

      connectDragSource,
      connectDragPreview,
    } = this.props;
    const {
      code,
    } = this.state;

    const {
      root,
      container,
      pre,
      button,
      left,
      leftLabel,
      prefix,
    } = getStyle(this.props, this.context, this.state);

    const events = {
      [TOUCH_START]: () => this.setState({ code: true }),
      [TOUCH_END]: () => this.setState({ code: false }),
      onTouchTap: this.handleTouch,
    };

    return (
      <div style={root}>
      {connectDragSource(
        <div style={container} {...events}>
        {code ? connectDragPreview(
          <pre style={pre}>{snippet.text}</pre>
        ) : (
          <Paper style={button}>
            <div style={prefix}>{snippet.prefix}</div>
            <div style={leftLabel}>{snippet.renderLeftLabel(findFile)}</div>
          </Paper>
        )}
        </div>
      )}
      </div>
    );
  }
}


const spec = {
  beginDrag(props, monitor, component) {
    const { snippet } = props;
    setTimeout(() => {
      component.setState({ code: false });
    }, 1);
    return { snippet };
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
});

export default DragSource(DragTypes.Snippet, spec, collect)(SnippetButton)
