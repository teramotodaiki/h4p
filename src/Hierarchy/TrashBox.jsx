import React, { Component, PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';


import { Types } from './FileCard';


class _TrashBox extends Component {

  static propTypes = {
    updateFile: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const {
      connectDropTarget,
    } = this.props;
    const { palette } = this.context.muiTheme;

    return connectDropTarget(
      <div>
        <IconButton>
          <ActionDelete color={palette.secondaryTextColor} />
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
        isTrashed: true,
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
