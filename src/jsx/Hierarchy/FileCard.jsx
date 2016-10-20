import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import { Paper } from 'material-ui';
import { transparent } from 'material-ui/styles/colors';
import EditorDragHandle from 'material-ui/svg-icons/editor/drag-handle';


import {
  Types,
  CardHeight, BlankWidth, StepWidth, BorderWidth,
  label2Color, backgroundColor, selectedColor,
} from './constants';
import Filename from './Filename';

class FileCard extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
    handleNameChange: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  render() {
    const {
      file, selectedFile, tabbedFiles, handleFileSelect, handleFileMove, handleNameChange,
      connectDragSource, connectDragPreview, isDragging,
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
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all .2s ease',
      opacity: isDragging ? .5 : 1,
    };

    const dragHandleStyle = {
      flex: '0 0 auto',
      width: 24,
      height: 24,
      marginLeft: -4,
      marginRight: 8,
      cursor: 'move',
    };

    const contentStyle = {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    };

    return connectDragPreview(
      <div>
        <Paper
          zDepth={isSelected(file, 2, 0)}
          onTouchTap={() => handleFileSelect(file)}
          style={style}
        >
          {connectDragSource(
            <div style={dragHandleStyle}><EditorDragHandle color={label2Color} /></div>
          )}
          <div style={contentStyle}>
            <Filename file={file} handleNameChange={handleNameChange} />
            <div>
              <span style={{ color: label2Color }}>{file.type}</span>
            </div>
          </div>
        </Paper>
      </div>
    );
  }
}

const spec = {
  beginDrag(props) {
    return { files: [props.file] };
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
});

export default DragSource(Types.FILE, spec, collect)(FileCard)
