import React, { Component, PropTypes } from 'react';
import TextField from 'material-ui/TextField';
import ContentCreate from 'material-ui/svg-icons/content/create';


const TapTwiceQuickly = 'Tap twice quickly';

const getStyles = (props, context) => {
  const {
    prepareStyles,
    palette,
  } = context.muiTheme;

  return {
    hint: prepareStyles({
      color: palette.secondaryTextColor,
      fontStyle: 'italic',
      fontSize: '.8em',
      borderBottom: `1px dashed ${palette.secondaryTextColor}`
    }),
    label: {
      fontSize: 16,
    },
  };
};

export default class EditableLabel extends Component {

  static propTypes = Object.assign({
    onEditEnd: PropTypes.func,
  }, TextField.propTypes);

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

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
    const { value, defaultValue } = this.props;

    const labelText = value || defaultValue;

    const {
      prepareStyles,
      palette: { secondaryTextColor },
    } = this.context.muiTheme;

    const {
      hint,
      label,
    } = getStyles(this.props, this.context);

    const style = prepareStyles(
      Object.assign({}, label, this.props.style)
    );

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
      {labelText}
      </div>
    ) : (
      <div
        style={hint}
        onTouchTap={this.handleTouch}
      >
        <ContentCreate color={secondaryTextColor} />
        {TapTwiceQuickly}
      </div>
    );
  }
}
