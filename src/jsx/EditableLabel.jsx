import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import ContentCreate from 'material-ui/svg-icons/content/create';
import { grey600 } from 'material-ui/styles/colors';


const TapTwiceQuickly = 'Tap twice quickly';

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

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.isEditing && this.state.isEditing) {
      if (this.input) {
        this.input.focus();
      }
    }
  }

  render() {
    const { isEditing } = this.state;
    const { value, defaultValue, style } = this.props;

    const labelText = value || defaultValue;

    const hintStyle = Object.assign({}, style, {
      color: grey600,
      fontStyle: 'italic',
      fontSize: '.8em',
      borderBottom: `1px dashed ${grey600}`
    });

    return isEditing ? (
      <TextField
        {...this.props}
        onBlur={this.handleBlur}
        ref={(ref) => ref && (this.input = ref.input)}
      />
    ) : labelText ? (
      <div
        style={style}
        onTouchTap={this.handleTouch}
      >
      {value || defaultValue}
      </div>
    ) : (
      <div
        style={hintStyle}
        onTouchTap={this.handleTouch}
      >
        <ContentCreate color={grey600} />
        {TapTwiceQuickly}
      </div>
    );
  }
}
