import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import ContentCreate from 'material-ui/svg-icons/content/create';
import { grey600 } from 'material-ui/styles/colors';


const TapTwiceQuickly = 'Tap twice quickly';

export default class EditableLabel extends Component {

  static propTypes = Object.assign({
    onEditEnd: PropTypes.func,
  }, TextField.propTypes);

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

  handleKeyPress = () => {
    if (event.key === 'Enter') {
      this.setState({ isEditing: false });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (!this.input) return;

    if (!prevState.isEditing && this.state.isEditing) {
      this.input.focus();
    }
    if (prevState.isEditing && !this.state.isEditing) {
      this.props.onEditEnd(this.input.value);
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

    const props = Object.assign({}, this.props);
    delete props.onEditEnd;

    return isEditing ? (
      <TextField
        {...props}
        ref={(ref) => ref && (this.input = ref.input)}
        onBlur={this.handleBlur}
        onKeyPress={this.handleKeyPress}
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
