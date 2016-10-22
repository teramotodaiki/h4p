import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/TextField';


import { labelColor, label2Color } from './constants';
import { separate } from '../../js/files';

export default class Filename extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    handleNameChange: PropTypes.func.isRequired,
  };

  state = {
    isEditing: false,
  };

  handleInput = (ref) => {
    const { file, handleNameChange } = this.props;

    if (!ref) return;
    ref.input.onchange = ({ target }) => {
      handleNameChange(file, target.value);
      this.setState({ isEditing: false });
    };
    ref.input.onblur = (event) => {
      this.setState({ isEditing: false })
    };
  };

  touchFlag = false;
  handleDoubleTap = (event) => {
    event.stopPropagation();

    if (this.touchFlag) {
      this.setState({ isEditing: true });
      return;
    }
    this.touchFlag = true;
    setTimeout(() => this.touchFlag = false, 200);
  };

  render() {
    const { file } = this.props;
    const { isEditing } = this.state;

    const style = {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'baseline',
    };

    const pathStyle = {
      color: label2Color,
    };

    const planeStyle = {
      color: labelColor,
    };

    const extStyle = {
      color: label2Color,
      fontSize: '.8em',
      paddingLeft: 4,
    };

    const textFieldStyle = {
      width: 'auto',
      flex: '0 1 auto',
      height: 40,
    };

    const { path, plane, ext, name } = separate(file.name);

    return (
      <div style={style}>
        <span style={pathStyle}>{path}</span>
        {isEditing ? (
          <TextField
            id={name}
            defaultValue={plane}
            ref={this.handleInput}
            style={textFieldStyle}
          />
        ) : (
          <span
            onTouchTap={this.handleDoubleTap}
            style={planeStyle}
          >
            {plane}
          </span>
        )}
        <span style={extStyle}>{ext}</span>
      </div>
    );
  }
}
