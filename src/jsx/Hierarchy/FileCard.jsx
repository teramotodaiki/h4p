import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import { Paper } from 'material-ui';
import { transparent } from 'material-ui/styles/colors';


import {
  Types,
  CardHeight, BlankWidth, StepWidth, BorderWidth,
  labelColor, label2Color, backgroundColor, selectedColor,
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
      transition: 'all .2s ease',
      opacity: isDragging ? .5 : 1,
    };

    const pathStyle = {
      color: label2Color,
    };

    const nameStyle = {
      color: labelColor,
    };

    const { path, name } = separate(file.name);

    return connectDragSource(
      <div>
        <Paper
          zDepth={isSelected(file, 2, 0)}
          onTouchTap={() => handleFileSelect(file)}
          style={style}
        >
          <span style={pathStyle}>{path}</span>
          <span style={nameStyle}>{name}</span>
        </Paper>
      </div>
    );
  }
}

const separate = (fullpath) => {
  if (!fullpath.includes('/')) {
    return { path: '', name: fullpath };
  }
  const slash = fullpath.lastIndexOf('/');
  const path = fullpath.substr(0, slash + 1);
  const name = fullpath.substr(slash + 1);
  return { path, name };
};

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
