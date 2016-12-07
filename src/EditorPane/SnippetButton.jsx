import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import NavigationMoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';


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
    mini,
    code,
  } = state;

  const commonAlignment = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return {
    root: {
      position: 'relative',
      flex: '0 0 auto',
      boxSizing: 'border-box',
      width: mini ? '6rem' : '100%',
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
      display: 'flex',
      justifyContent: 'center',
    },
    pre: {
      backgroundColor: palette.canvasColor,
    },
    left: commonAlignment,
    prefix: {
      fontSize: '1rem',
    },
    leftLabel: {
      fontSize: '.5rem',
    },
    right: Object.assign({
      flex: '1 1 auto',
    }, commonAlignment),
    description: {
      fontSize: '1rem',
    },
    rightLabel: {
      fontSize: '.5rem',
    },
    more: {
      position: 'absolute',
      left: 0,
      bottom: -4,
    },
  };
};

class SnippetButton extends Component {

  static propTypes = {
    snippet: PropTypes.object.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    mini: true,
    code: false,
  };

  handleToggle = () => {
    const mini = !this.state.mini;
    this.setState({ mini });
  };

  render() {
    const {
      snippet,
      isDragging,

      connectDragSource,
      connectDragPreview,
    } = this.props;
    const {
      mini,
      code,
    } = this.state;

    const {
      root,
      container,
      pre,
      button,
      left,
      prefix,
      leftLabel,
      right,
      description,
      rightLabel,
      more,
      moreIcon,
    } = getStyle(this.props, this.context, this.state);

    const events = {
      [TOUCH_START]: () => this.setState({ code: true }),
      [TOUCH_END]: () => this.setState({ code: false }),
    };

    return (
      <div style={root}>
      {connectDragSource(
        <div style={container} {...events}>
        {code ? connectDragPreview(
          <pre style={pre}>{snippet.text}</pre>
        ) : (
          <Paper style={button} onTouchTap={this.handleToggle}>
            <div style={left}>
              <span style={prefix}>{snippet.prefix}</span>
              <span style={leftLabel}>{snippet.leftLabel}</span>
            </div>
            {mini ? null : (
            <div style={right}>
              <span style={prefix}>{snippet.description}</span>
              <code style={rightLabel}>{snippet.rightLabel}</code>
            </div>
            )}
          </Paper>
        )}
        </div>
      )}
        <IconButton
          style={more}
          iconStyle={moreIcon}
          onTouchTap={this.handleToggle}
        >
          <NavigationMoreHoriz />
        </IconButton>
      </div>
    );
  }
}


const spec = {
  beginDrag(props) {
    const { snippet } = props;
    return { snippet };
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
});

export default DragSource(DragTypes.Snippet, spec, collect)(SnippetButton)
