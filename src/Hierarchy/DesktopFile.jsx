import React, { Component, PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';
import { DropTarget } from 'react-dnd';
import HardwareComputer from 'material-ui/svg-icons/hardware/computer';
import { transparent } from 'material-ui/styles/colors';


import { Types } from './FileCard';
import { SaveDialog } from '../FileDialog/';

const getStyles = (props, context, state) => {
  const { isOver } = props;
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;

  return {
    input: prepareStyles({
      display: 'none',
    }),
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

class _DesktopFile extends Component {

  static propTypes = {
    onOpen: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  handleChange = (event) => {
    this.props.onOpen(
      Array.from(event.target.files)
    );
  };

  render() {
    const {
      onOpen,

      connectDropTarget,
    } = this.props;
    const { palette } = this.context.muiTheme;

    const {
      input,
      icon,
    } = getStyles(this.props, this.context);

    return connectDropTarget(
      <div>
        <input multiple
          type="file"
          style={input}
          ref={(ref) => ref && (this.input = ref)}
          onChange={this.handleChange}
        />
        <IconButton
          style={icon}
          onTouchTap={() => this.input && this.input.click()}
        >
          <HardwareComputer color={palette.secondaryTextColor} />
        </IconButton>
      </div>
    );
  }
}

const spec = {
  drop(props, monitor, component) {
    // const { updateFile } = props;
    const { files } = monitor.getItem();
    files.forEach((file) => {
      const a = document.createElement('a');

      if (typeof a.download === 'string') {
        a.download = file.name;
        a.href = file.blobURL || URL.createObjectURL(
          new Blob([file.text], { type: file.type })
        );
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(event);
      } else {
        // for Safari
        props.openFileDialog(SaveDialog, { content: file });
      }
    });
    return {};
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
});

const DesktopFile = DropTarget(Types.FILE, spec, collect)(_DesktopFile);
export default DesktopFile;