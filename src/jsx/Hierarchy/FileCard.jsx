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
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    handleFileSelect: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  render() {
    const {
      file, selectedFile, tabbedFiles, handleFileSelect, handleFileMove,
      connectDragSource, isDragging,
    } = this.props;

    const isSelected = (file, passed, failed) => selectedFile === file ? passed : failed;
    const isTabbed = (file, passed, failed) => tabbedFiles.includes(file) ? passed : failed;

    const style = {
      boxSizing: 'border-box',
      height: CardHeight,
      marginTop: BlankWidth,
      marginRight: isSelected(file, 0, StepWidth),
      padding: '.25rem',
      paddingLeft: StepWidth,
      borderWidth: BorderWidth,
      borderStyle: 'solid',
      borderColor: transparent,
      borderTopRightRadius: isSelected(file, 0, 2),
      borderBottomRightRadius: isSelected(file, 0, 2),
      backgroundColor: isTabbed(file, selectedColor, backgroundColor),
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
          onTouchTap={() => handleFileSelect(file)}
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
    return { files: props.tabbedFiles };
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

export default DragSource(Types.FILE, spec, collect)(FileCard)
