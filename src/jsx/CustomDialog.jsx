import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import Popover from 'material-ui/Popover';
import { convertColorToString } from 'material-ui/utils/colorManipulator';
import ChromePicker from 'react-color/lib/components/chrome/Chrome';


export default class CustomDialog extends Component {

  static propTypes = {
    palette: PropTypes.object.isRequired,
    updatePalette: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  };

  state = {
    palette: this.props.palette,
    open: false,
    key: null,
    anchorEl: null,
  };

  handleRectClick = (event, key, color) => {
    const anchorEl = event.target;
    this.setState({ open: true, key, anchorEl, color });
  };

  handleChangeComplete = (structure) => {
    const { key } = this.state;
    const { updatePalette } = this.props;

    const { r, g, b, a } = structure.rgb;
    const color = ({ type: 'rgba', values: [r, g, b, a] });
    updatePalette({ [key]: convertColorToString(color) })
      .then(palette => this.setState({ palette }));
  };

  closePopover = () => {
    this.setState({ open: false });
  };

  render() {
    const { onRequestClose } = this.props;
    const { open, key, anchorEl, palette } = this.state;

    const divStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      maxWidth: 300,
      marginLeft: 0,
      marginRight: 'auto',
    };

    const rectStyle = (color) => ({
      boxSizing: 'border-box',
      marginLeft: 20,
      padding: '.5rem',
      border: '1px solid black',
      backgroundColor: color,
    });

    return (
      <Dialog title="Colors" modal={false} open={true} onRequestClose={onRequestClose}>
      {Object.keys(palette).map(key => (
        <div key={key} style={divStyle}>
          <span>{key}</span>
          <span
            onTouchTap={(event) => this.handleRectClick(event, key, palette[key])}
            style={rectStyle(palette[key])}
          ></span>
        </div>
      ))}
      <Popover
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onRequestClose={this.closePopover}
      >
        <ChromePicker
          color={key && palette[key]}
          onChangeComplete={this.handleChangeComplete}
        />
      </Popover>
      </Dialog>
    );
  }
}
