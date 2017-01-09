import React, { PureComponent, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import { transparent } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import { NativeTypes } from 'react-dnd-html5-backend';


import FileCard from './FileCard';
import getHierarchy from './getHierarchy';
import DragTypes from '../utils/dragTypes';

const getStyles = (props, context) => {
  const {
    isRoot,
    isDirOpened,
    isOver,
    dragSource,
  } = props;
  const cd = props.dir;
  const { palette, spacing } = context.muiTheme;

  const borderStyle =
    isOver && !cd.files.includes(dragSource) ?
    'dashed' : 'solid';
  const borderWidth = 4;

  return {
    root: isRoot ? {
      paddingTop: spacing.desktopGutterMore,
      paddingRight: 0,
      paddingBottom: spacing.desktopGutterMore,
      paddingLeft: spacing.desktopGutterLess,
    } : {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'space-around',
      boxSizing: 'border-box',
      height: isDirOpened(cd, 'auto', 40),
      marginTop: spacing.desktopGutterLess,
      marginRight: isDirOpened(cd, 0, spacing.desktopGutterLess),
      paddingBottom: isDirOpened(cd, spacing.desktopGutterLess, 0),
      paddingLeft: isDirOpened(cd, spacing.desktopGutterLess, 0),
      borderWidth,
      borderRightWidth: isDirOpened(cd, 0, borderWidth),
      borderStyle,
      borderColor: palette.primary1Color,
      borderRadius: 2,
      borderTopRightRadius: isDirOpened(cd, 0, 2),
      borderBottomRightRadius: isDirOpened(cd, 0, 2),
      transition: transitions.easeOut(null, [
        'margin', 'padding-bottom', 'border'
      ])
    },
    closed: {
      color: palette.secondaryTextColor,
      paddingLeft: spacing.desktopGutterLess,
      cursor: 'pointer',
    },
    closer: {
      marginLeft: -spacing.desktopGutterLess,
      backgroundColor: palette.primary1Color,
      cursor: 'pointer',
    },
    closerLabel: {
      paddingLeft: spacing.desktopGutterLess,
      fontWeight: 'bold',
      color: palette.alternateTextColor,
    },
  };
};

class _DirCard extends PureComponent {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    isDirOpened: PropTypes.func.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
    handleDirToggle: PropTypes.func.isRequired,
    handleFileMove: PropTypes.func.isRequired,
    handleNativeDrop: PropTypes.func.isRequired,
    isRoot: PropTypes.bool,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    dragSource: PropTypes.object,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  static defaultProps = {
    isRoot: false
  };

  render() {
    const {
      isRoot,
      isDirOpened,
      handleDirToggle,

      connectDropTarget,
    } = this.props;
    const cd = this.props.dir;
    const { prepareStyles } = this.context.muiTheme;

    const transfer = {
      selectedFile: this.props.selectedFile,
      tabbedFiles: this.props.tabbedFiles,
      isDirOpened: this.props.isDirOpened,
      handleFileSelect: this.props.handleFileSelect,
      handleDirToggle: this.props.handleDirToggle,
      handleFileMove: this.props.handleFileMove,
      handleNativeDrop: this.props.handleNativeDrop,
      openFileDialog: this.props.openFileDialog,
      putFile: this.props.putFile,
    };

    const {
      root,
      closed,
      closer,
      closerLabel
    } = getStyles(this.props, this.context);

    const closerProps = {
      style: prepareStyles(closer),
      labelStyle: prepareStyles(closerLabel),
      onTouchTap: () => handleDirToggle(cd),
    };

    return connectDropTarget(
      <div style={prepareStyles(root)}>
      {isDirOpened(cd, [].concat(
          isRoot ? null : <DirCloser key="closer" {...closerProps} />,
          cd.dirs.map(dir => <DirCard key={dir.path} dir={dir} {...transfer} />),
          cd.files.map(file => <FileCard key={file.key} file={file} {...transfer}  />)
        ),
        <div
          style={prepareStyles(closed)}
          onTouchTap={() => handleDirToggle(cd)}
        >
        {cd.path}
        </div>
      )}
      </div>
    );
  }
}

const spec = {
  drop(props, monitor, component) {
    if (monitor.getDropResult()) {
      return;
    }
    const { files } = monitor.getItem();
    switch (monitor.getItemType()) {
      case DragTypes.File:
        files
          .filter(file => !props.dir.files.includes(file))
          .forEach(file => props.handleFileMove(file, props.dir));
        break;
      case NativeTypes.FILE:
        props.handleNativeDrop(files, props.dir);
        break;
    }
    return {};
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
  dragSource: monitor.getItem(),
});

const DirCard = DropTarget([DragTypes.File, NativeTypes.FILE], spec, collect)(_DirCard);
export default DirCard;


export const DirCloser = (props) => {
  return (
    <div style={props.style} onTouchTap={props.onTouchTap}>
      <span style={props.labelStyle}>../</span>
    </div>
  )
};
