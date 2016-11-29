import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import { transparent } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';
import EditorDragHandle from 'material-ui/svg-icons/editor/drag-handle';
import ActionSettings from 'material-ui/svg-icons/action/settings';


import Filename from './Filename';
import { PreferenceDialog } from '../FileDialog/';
import { changeName } from '../js/files';
import DragTypes from '../utils/dragTypes';


const getStyles = (props, context) => {
  const {
    file,
    selectedFile,
    tabbedFiles,
    isDragging,
  } = props;
  const {
    palette,
    spacing,
  } = context.muiTheme;

  const isSelected = selectedFile === file;
  const backgroundColor = tabbedFiles.includes(file) ?
    fade(palette.canvasColor, 1) : palette.disabledColor;

  return {
    root: {
      marginTop: spacing.desktopGutterLess,
      marginRight: isSelected ? 0 : spacing.desktopGutterLess,
      transition: transitions.easeOut(),
    },
    card: {
      boxSizing: 'border-box',
      height: 40,
      paddingLeft: spacing.desktopGutterLess,
      borderTopRightRadius: isSelected ? 0 : 2,
      borderBottomRightRadius: isSelected ? 0 : 2,
      backgroundColor,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      opacity: isDragging ? .5 : 1,
      transition: transitions.easeOut(),
    },
    dragHandle: {
      flex: '0 0 auto',
      width: spacing.iconSize,
      height: spacing.iconSize,
      marginRight: spacing.desktopGutterMini,
      cursor: 'move',
    },
    container: {
      flex: '1 1 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  };
};

class FileCard extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  handleConfirmSettings = (event) => {
    const { file, openFileDialog, putFile } = this.props;

    event.stopPropagation();
    openFileDialog(PreferenceDialog, {
      content: file,
    })
    .then((change) => putFile(file, Object.assign({}, file, change)));
  };

  handleNameChange = (event, name) => {
    const { file, putFile } = this.props;

    return putFile(file, changeName(file, name));
  };

  render() {
    const {
      file, selectedFile, handleFileSelect,
      connectDragSource, connectDragPreview,
    } = this.props;
    const {
      prepareStyles,
      palette: {
        secondaryTextColor,
      },
    } = this.context.muiTheme;

    const isSelected = selectedFile === file;

    const {
      root,
      card,
      dragHandle,
      container,
    } = getStyles(this.props, this.context);

    return connectDragPreview(
      <div style={root}>
        <Paper
          zDepth={isSelected ? 2 : 0}
          onTouchTap={() => handleFileSelect(file)}
          style={card}
        >
          {connectDragSource(
            <div style={prepareStyles(dragHandle)}>
              <EditorDragHandle color={secondaryTextColor} />
            </div>
          )}
          <div style={prepareStyles(container)}>
            <Filename file={file} onChange={this.handleNameChange} />
          </div>
          <IconButton onTouchTap={this.handleConfirmSettings}>
            <ActionSettings color={secondaryTextColor} />
          </IconButton>
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

export default DragSource(DragTypes.File, spec, collect)(FileCard)
