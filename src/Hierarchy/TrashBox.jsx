import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';


import { Types } from './FileCard';

const getStyles = (props, context, state) => {
  const { isOver } = props;
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;

  const size = 40;
  const borderWidth = isOver ? 4 : 0;

  return {
    icon: {
      width: size,
      height: size,
      boxSizing: 'border-box',
      padding: (size - spacing.iconSize) / 2 - borderWidth,
      borderWidth,
      borderStyle: 'dashed',
      borderColor: palette.primary1Color,
      transition: 'none',
    },
  };
};

class _TrashBox extends Component {

  static propTypes = {
    showTrashes: PropTypes.bool.isRequired,
    updateFile: PropTypes.func.isRequired,
    onTouchTap: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const {
      showTrashes,
      connectDropTarget,
      onTouchTap,
    } = this.props;
    const { palette } = this.context.muiTheme;

    const {
      icon,
    } = getStyles(this.props, this.context);

    return connectDropTarget(
      <div>
        <IconButton style={icon} onTouchTap={onTouchTap}>
        {showTrashes ? (
          <NavigationArrowBack color={palette.secondaryTextColor} />
        ) : (
          <ActionDelete color={palette.secondaryTextColor} />
        )}
        </IconButton>
      </div>
    );
  }
}

const spec = {
  drop(props, monitor, component) {
    const { updateFile } = props;
    const { files } = monitor.getItem();

    files.forEach((file) => {
      const options = Object.assign({}, file.options, {
        isTrashed: !file.options.isTrashed,
      });
      updateFile(file, { options });
    });
    return {};
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
});

const TrashBox = DropTarget(Types.FILE, spec, collect)(_TrashBox);
export default TrashBox;
