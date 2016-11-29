import { DragSource } from 'react-dnd';


import DragTypes from '../utils/dragTypes';

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

export default DragSource(DragTypes.Sizer, spec, collect);
