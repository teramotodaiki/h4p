import React, { PureComponent, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import Paper from 'material-ui/Paper';
import transitions from 'material-ui/styles/transitions';


import DragTypes from '../utils/dragTypes';

export const SizerWidth = 24;

const getStyles = (props, context) => {

  const {
    palette,
  } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      width: SizerWidth,
      paddingBottom: 4,
      display: 'flex',
      overflow: 'hidden',
      cursor: 'col-resize',
      zIndex: 200,
    },
    preview: {
      flex: '1 1 auto',
      borderRadius: '0 0 0 4px',
      backgroundColor: props.showMonitor ?
         palette.accent1Color : palette.primary1Color,
    },
  };

};

class Sizer extends PureComponent {

  static propTypes = {
    monitorWidth: PropTypes.number.isRequired,
    monitorHeight: PropTypes.number.isRequired,
    onSizer: PropTypes.func.isRequired,
    showMonitor: PropTypes.bool.isRequired,

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
      preview,
    } = getStyles(this.props, this.context);

    return connectDragSource(
      <div style={root}>
      {connectDragPreview(
        <div style={preview} />
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
