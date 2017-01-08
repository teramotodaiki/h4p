import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import Paper from 'material-ui/Paper';
import transitions from 'material-ui/styles/transitions';


import DragTypes from '../utils/dragTypes';

export const SizerWidth = 24;

const getStyles = (props, context) => {

  const { monitorWidth, monitorHeight } = props;
  const {
    palette,
    spacing,
  } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      width: SizerWidth,
      paddingBottom: 4,
      overflow: 'hidden',
      cursor: 'col-resize',
      zIndex: 200,
      transition: transitions.easeOut(),
    },
    preview: {
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
    },
    color: {
      width: '100%',
      height: '100%',
      borderRadius: '0 0 0 4px',
      backgroundColor: palette.primary1Color,
    },
  };

};

class Sizer extends Component {

  static propTypes = {
    monitorWidth: PropTypes.number.isRequired,
    monitorHeight: PropTypes.number.isRequired,
    onSizer: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    isActive: false,
  };

  componentWillReceiveProps(nextProps) {
    const { isDragging, onSizer } = this.props;

    if (!isDragging && nextProps.isDragging) {
      onSizer(true);
    } else if (isDragging && !nextProps.isDragging) {
      onSizer(false);
    }
  }

  render() {
    const {
      connectDragSource,
      connectDragPreview,
    } = this.props;

    const {
      root,
      color,
      preview,
    } = getStyles(this.props, this.context);

    return connectDragSource(
      <div style={root}>
      {connectDragPreview(
        <div style={preview}>
          <Paper style={color} />
        </div>
      )}
      </div>
    );
  }
}

const spec = {
  beginDrag(props) {
    return {
      width: props.monitorWidth,
      height: props.monitorHeight,
    };
  },
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
});

export default DragSource(DragTypes.Sizer, spec, collect)(Sizer);
