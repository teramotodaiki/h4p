import React, { Component, PropTypes } from 'react';
import { Dialog, Popover } from 'material-ui';
import { lightBaseTheme } from 'material-ui/styles';
import { ChromePicker } from 'react-color';


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
    const { key, palette } = this.state;

    const change = { [key]: structure.hex };
    this.setState({ palette: Object.assign({}, palette, change) });
    this.props.updatePalette(change);
  };

  closePopover = () => {
    this.setState({ open: false });
  };

  render() {
    const { onRequestClose } = this.props;
    const palette = Object.assign({}, lightBaseTheme.palette, this.state.palette);
    const { open, key, anchorEl } = this.state;

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
