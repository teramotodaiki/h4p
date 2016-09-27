import React, { Component, PropTypes } from 'react';
import { TextField, DropDownMenu, MenuItem } from 'material-ui';

const defaultName = 'filename';

const extensions = [
  '.js',
  '.html',
];

export default class FilenameInput extends Component {

  static propTypes = {
    defaultName: PropTypes.string,
    defaultExt: PropTypes.string,
    disabled: PropTypes.bool,
  };

  state = {
    name: this.props.defaultName || defaultName,
    ext: this.props.defaultExt || extensions[0]
  };

  static index = 0;
  constructor(props) {
    super(props);

    this.id = 'FILENAME_INPUT_' + (++FilenameInput.index);
  }

  get value() {
    const { name, ext } = this.state;
    return name + ext;
  }

  get name() {
    return this.state.name;
  }

  get ext() {
    return this.state.name;
  }

  handleFilenameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  handleExtChange = (event, index, value) => {
    this.setState({ ext: value });
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
    const { name, ext } = this.state;
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
            onChange={this.handleFilenameChange}
          />
        </TextField>
        <DropDownMenu
          value={ext}
          disabled={disabled}
          onChange={this.handleExtChange}
          style={dropDownStyle}
        >
        {extensions.map(item => (
          <MenuItem key={item} value={item} primaryText={item} />
        ))}
        </DropDownMenu>
      </div>
    );
  }
}
