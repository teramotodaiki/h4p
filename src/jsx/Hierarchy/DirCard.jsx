import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import { transparent } from 'material-ui/styles/colors';
import { NativeTypes } from 'react-dnd-html5-backend';


import FileCard from './FileCard';
import {
  Types,
  CardHeight, BlankWidth, StepWidth, BorderWidth,
  labelColor, label2Color, borderColor, backgroundColor, selectedColor,
} from './constants';
import getHierarchy from './getHierarchy';

class _DirCard extends Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    isDirOpened: PropTypes.func.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
    handleDirToggle: PropTypes.func.isRequired,
    handleFileMove: PropTypes.func.isRequired,
    handleNativeDrop: PropTypes.func.isRequired,
    handleNameChange: PropTypes.func.isRequired,
    isRoot: PropTypes.bool,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    dragSource: PropTypes.object,
  };

  static defaultProps = {
    isRoot: false
  };

  render() {
    const {
      isDirOpened, handleDirToggle, handleFileMove, handleNativeDrop, isRoot,
      connectDropTarget, isOver, dragSource,
    } = this.props;
    const cd = this.props.dir;

    const transfer = {
      selectedFile: this.props.selectedFile,
      tabbedFiles: this.props.tabbedFiles,
      isDirOpened: this.props.isDirOpened,
      handleFileSelect: this.props.handleFileSelect,
      handleDirToggle: this.props.handleDirToggle,
      handleFileMove: this.props.handleFileMove,
      handleNativeDrop: this.props.handleNativeDrop,
      handleNameChange: this.props.handleNameChange,
    };

    const dashed = isOver && !cd.files.includes(dragSource);

    const dirStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'space-around',
      boxSizing: 'border-box',
      height: isDirOpened(cd, 'auto', CardHeight),
      marginTop: BlankWidth,
      borderColor: borderColor,
      borderStyle: dashed ? 'dashed' : 'solid',
      borderTopWidth: BorderWidth,
      borderRightWidth: isDirOpened(cd, 0, BorderWidth),
      borderBottomWidth: BorderWidth,
      borderLeftWidth: BorderWidth,
      borderRadius: 2,
      borderTopRightRadius: isDirOpened(cd, 0, 2),
      borderBottomRightRadius: isDirOpened(cd, 0, 2),
      marginRight: isDirOpened(cd, 0, StepWidth),
      paddingBottom: isDirOpened(cd, BlankWidth, 0),
      paddingLeft: isDirOpened(cd, StepWidth, 0),
      backgroundColor: isDirOpened(cd, transparent, backgroundColor),
      transition: 'margin .2s ease, padding-bottom .2s ease, border .2s ease',
    };

    const rootStyle = {
      padding: '3rem 0 3rem 1rem',
    };

    const closedStyle = {
      color: label2Color,
      paddingLeft: StepWidth,
      cursor: 'pointer',
    };

    const hierarchy =
      isDirOpened(cd, [].concat(
        isRoot ? null : <DirCloser key="closer" onTouchTap={() => handleDirToggle(cd)} />,
        cd.dirs.map(dir => <DirCard key={dir.path} dir={dir} {...transfer} />),
        cd.files.map(file =><FileCard key={file.key} file={file} {...transfer}  />)
      ),
      <div style={closedStyle} onTouchTap={() => handleDirToggle(cd)}>{cd.path}</div>
    );

    return connectDropTarget(
      <div style={isRoot ? rootStyle : dirStyle}>
      {hierarchy}
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
      case Types.FILE:
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

const DirCard = DropTarget([Types.FILE, NativeTypes.FILE], spec, collect)(_DirCard);
export default DirCard;


export const DirCloser = (props) => {
  const style = {
    marginLeft: -StepWidth,
    backgroundColor: borderColor,
    cursor: 'pointer',
  };

  const backwordStyle = {
    paddingLeft: StepWidth,
    fontWeight: 'bold',
    color: labelColor,
  };

  return (
    <div style={style} onTouchTap={props.onTouchTap}>
      <span style={backwordStyle}>../</span>
    </div>
  )
};
