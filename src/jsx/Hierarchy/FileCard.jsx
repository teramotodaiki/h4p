import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import { Paper } from 'material-ui';
import { transparent } from 'material-ui/styles/colors';


import {
  Types,
  CardHeight, BlankWidth, StepWidth, BorderWidth,
  labelColor, backgroundColor, selectedColor,
} from './constants';

class FileCard extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    isSelected: PropTypes.func.isRequired,
    isSelectedOne: PropTypes.func.isRequired,
    handleSelectFile: PropTypes.func.isRequired,
    handleFileMove: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  render() {
    const {
      file, isSelected, isSelectedOne, handleSelectFile, handleFileMove,
      connectDragSource, isDragging,
    } = this.props;

    const style = {
      boxSizing: 'border-box',
      height: CardHeight,
      marginTop: BlankWidth,
      marginRight: isSelectedOne(file, 0, StepWidth),
      padding: '.25rem',
      paddingLeft: StepWidth,
      borderWidth: BorderWidth,
      borderStyle: 'solid',
      borderColor: transparent,
      borderTopRightRadius: isSelectedOne(file, 0, 2),
      borderBottomRightRadius: isSelectedOne(file, 0, 2),
      backgroundColor: isSelected(file, selectedColor, backgroundColor),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      color: labelColor,
      transition: 'all .2s ease',
      opacity: isDragging ? .5 : 1,
    };

    return connectDragSource(
      <div>
        <Paper
          zDepth={isSelected(file, 2, 0)}
          onTouchTap={() => handleSelectFile(file)}
          style={style}
        >
        {file.name}
        </Paper>
      </div>
    );
  }
}

const spec = {
  beginDrag(props) {
    return props.file;
  },
  endDrag(props, monitor, component) {
    const result = monitor.getDropResult();
    if (result && !result.files.includes(props.file)) {
      props.handleFileMove(props.file, result)
        .catch(err => alert(err.message));
    }
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

export default DragSource(Types.FILE, spec, collect)(FileCard)
