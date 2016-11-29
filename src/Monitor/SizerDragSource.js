import { DragSource } from 'react-dnd';


import DragTypes from '../utils/dragTypes';

const spec = {
  beginDrag(props) {
    const {
      width,
      height,
      onSizer,
    } = props;

    setTimeout(() => onSizer(true), 0);
    return { width, height };
  },
  endDrag(props) {
    props.onSizer(false);
  },
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
});

export default DragSource(DragTypes.Sizer, spec, collect);
