import React, { PureComponent, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import { transparent } from 'material-ui/styles/colors';


import DragTypes from '../utils/dragTypes';

const getStyles = (props, state, context) => {
  const { isOver } = props;
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;

  return {
    icon: {
      borderWidth: 0,
      borderTopWidth: isOver ? spacing.desktopGutterMini : 0,
      borderStyle: 'solid',
      borderColor: transparent,
      backgroundColor: isOver ? palette.disabledColor : transparent,
      borderRadius: 2,
    },
  };
};

class _TrashBox extends PureComponent {

  static propTypes = {
    showTrashes: PropTypes.bool.isRequired,
    putFile: PropTypes.func.isRequired,
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
      onTouchTap,

      connectDropTarget,
    } = this.props;
    const { palette } = this.context.muiTheme;

    const {
      icon,
    } = getStyles(this.props, this.state, this.context);

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
    const { putFile } = props;
    const { files } = monitor.getItem();

    files.forEach((file) => {
      const options = Object.assign({}, file.options, {
        isTrashed: !file.options.isTrashed,
      });
      putFile(file, file.set({ options }));
    });
    return {};
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
});

const TrashBox = DropTarget(DragTypes.File, spec, collect)(_TrashBox);
export default TrashBox;
