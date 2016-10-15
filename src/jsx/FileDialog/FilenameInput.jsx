import React, { Component, PropTypes } from 'react';
import { TextField, DropDownMenu, MenuItem } from 'material-ui';


const extensions = {
  'text/javascript': '.js',
  'text/html': '.html',
};

const getUniqueId = (i => () => ++i)(0);

export default class FilenameInput extends Component {

  static propTypes = {
    defaultName: PropTypes.string,
    defaultType: PropTypes.string,
    disabled: PropTypes.bool,
  };

  state = {
    name: this.props.defaultName || 'filename',
    type: this.props.defaultType || 'text/javascript'
  };

  constructor(props) {
    super(props);

    this.id = 'FILENAME_INPUT_' + getUniqueId();
  }

  get value() {
    const { name, type } = this.state;
    return name + extensions[type];
  }

  get name() {
    return this.state.name;
  }

  get type() {
    return this.state.type;
  }

  handleNameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  handleTypeChange = (event, index, value) => {
    this.setState({ type: value });
  };

  componentDidMount() {
    if (this.input) {
      this.timer = window.setTimeout(() => {
        this.input.focus();
        this.input.select();
      }, 100);
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
  }

  render() {
    const { name, type } = this.state;
    const { defaultName, disabled } = this.props;

    const style = this.props.style;

    const dropDownStyle = {
      height: 43
    };

    return (
      <div style={style}>
        <TextField
          id={this.id}
          ref={(textField) => this.input = textField && textField.input}
        >
          <input
            autoFocus={true}
            defaultValue={name}
            disabled={disabled}
            onChange={this.handleNameChange}
          />
        </TextField>
        <DropDownMenu
          value={type}
          disabled={disabled}
          onChange={this.handleTypeChange}
          style={dropDownStyle}
        >
        {Object.keys(extensions).map(type => (
          <MenuItem key={type} value={type} primaryText={extensions[type]} />
        ))}
        </DropDownMenu>
      </div>
    );
  }
}
