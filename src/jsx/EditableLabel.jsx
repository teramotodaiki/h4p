import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/TextField';

export default class EditableLabel extends Component {

  static propTypes = TextField.propTypes;

  state = {
    isEditing: false
  };

  touched = false;
  handleTouch = () => {
    if (this.touched) {
      this.setState({ isEditing: true });
    }
    this.touched = true;
    setTimeout(() => this.touched = false, 200);
  };

  handleBlur = () => {
    this.setState({ isEditing: false });
  };

  render() {
    const { isEditing } = this.state;
    const { value, defaultValue, style } = this.props;

    return isEditing ? (
      <TextField
        {...this.props}
        onBlur={this.handleBlur}
      />
    ) : (
      <div
        style={style}
        onTouchTap={this.handleTouch}
      >
      {value || defaultValue}
      </div>
    );
  }
}
