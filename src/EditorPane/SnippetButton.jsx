import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import Paper from 'material-ui/Paper';


import DragTypes from '../utils/dragTypes';


const getStyle = (props, context) => {
  const {
    isDragging,
  } = props;

  const {
    palette,
    spacing,
  } = context.muiTheme;

  return {
    root: {
      flex: '1 1 auto',
      position: 'relative',
    },
    background: {
      position: 'relative',
      boxSizing: 'border-box',
      padding: spacing.desktopGutterMini,
      backgroundColor: palette.canvasColor,
      display: 'flex',
      justifyContent: 'center',
      zIndex: 2,
    },
    button: {
      position: 'relative',
      boxSizing: 'border-box',
      width: '5.5rem',
      height: '5.5rem',
      padding: spacing.desktopGutterMini,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isDragging ? .5 : 1,
    },
    prefix: {
      fontSize: '1rem',
    },
    leftLabel: {
      fontSize: '0.5rem',
    },
    hidden: {
      position: 'absolute',
      top: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    pre: {
      backgroundColor: palette.canvasColor,
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

  render() {
    const {
      snippet,
      isDragging,

      connectDragSource,
      connectDragPreview,
    } = this.props;

    const {
      root,
      background,
      button,
      prefix,
      leftLabel,
      hidden,
      pre
    } = getStyle(this.props, this.context);


    return connectDragSource(
      <div style={root}>
        <div style={background}>
          <Paper style={button}>
            <span style={prefix}>{snippet.prefix}</span>
            <span style={leftLabel}>{snippet.leftLabel}</span>
          </Paper>
        </div>
        <div style={hidden}>
        {connectDragPreview(
          <pre style={pre}>{snippet.text}</pre>
        )}
        </div>
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
