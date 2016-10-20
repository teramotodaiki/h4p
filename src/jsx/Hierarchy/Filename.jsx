import React, { Component, PropTypes } from 'react';
import { TextField } from 'material-ui';


import { labelColor, label2Color } from './constants';

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
    const { path, name } = separate(file.name);

    if (!ref) return;
    ref.input.onchange = ({ target }) => {
      handleNameChange(file, path + target.value);
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

    const pathStyle = {
      color: label2Color,
    };

    const nameStyle = {
      color: labelColor,
    };

    const { path, name } = separate(file.name);

    return (
      <div>
        <span style={pathStyle}>{path}</span>
        {isEditing ? (
          <TextField id="" defaultValue={name} ref={this.handleInput} />
        ) : (
          <span
            onTouchTap={this.handleDoubleTap}
            style={nameStyle}
          >
            {name}
          </span>
        )}
      </div>
    );
  }
}

const separate = (fullpath) => {
  if (!fullpath.includes('/')) {
    return { path: '', name: fullpath };
  }
  const slash = fullpath.lastIndexOf('/');
  const path = fullpath.substr(0, slash + 1);
  const name = fullpath.substr(slash + 1);
  return { path, name };
};
