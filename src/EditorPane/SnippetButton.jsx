import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import Paper from 'material-ui/Paper';


import DragTypes from '../utils/dragTypes';


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
  } = state;

  return {
    root: {
      position: 'relative',
      flex: mini ? '1 1 auto' : '1 0 100%',
    },
    background: {
      position: 'relative',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      backgroundColor: palette.canvasColor,
      display: 'flex',
      justifyContent: 'center',
      paddingTop: spacing.desktopGutterMini / 2,
      paddingBottom: spacing.desktopGutterMini / 2,
      paddingLeft: mini ? 0 : spacing.desktopGutterMini,
      paddingRight: mini ? 0 : spacing.desktopGutterMini,
      zIndex: 2,
    },
    button: {
      flex: mini ? '0 0 auto' : '1 1 auto',
      position: 'relative',
      display: 'flex',
      boxSizing: 'border-box',
      padding: spacing.desktopGutterMini,
      opacity: isDragging ? .5 : 1,
    },
    left: {
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '4.8rem',
      height: '4.8rem',
    },
    prefix: {
      fontSize: '1rem',
    },
    leftLabel: {
      fontSize: '0.5rem',
    },
    right: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
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

  state = {
    mini: true,
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
    } = this.state;

    const {
      root,
      background,
      button,
      left,
      prefix,
      leftLabel,
      right,
      hidden,
      pre,
    } = getStyle(this.props, this.context, this.state);


    return connectDragSource(
      <div style={root}>
        <div style={background}>
          <Paper style={button} onTouchTap={this.handleToggle}>
            <div style={left}>
              <span style={prefix}>{snippet.prefix}</span>
              <span style={leftLabel}>{snippet.leftLabel}</span>
            </div>
          {mini ? null : (
            <div style={right}>
              <span style={prefix}>{snippet.description}</span>
            </div>
          )}
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
