import React, { Component, PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';
import FileFolderOpen from 'material-ui/svg-icons/file/folder-open';


const getStyles = (props, context, state) => {
  const { isOver } = props;
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;

  const size = 40;

  return {
    input: prepareStyles({
      display: 'none',
    }),
  };
};

export default class OpenFile extends Component {

  static propTypes = {
    onOpen: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  handleChange = (event) => {
    this.props.onOpen(
      Array.from(event.target.files)
    );
  };

  render() {
    const {
      onOpen,
    } = this.props;
    const { palette } = this.context.muiTheme;

    const {
      input,
    } = getStyles(this.props, this.context);

    return (
      <div>
        <input multiple
          type="file"
          style={input}
          ref={(ref) => ref && (this.input = ref)}
          onChange={this.handleChange}
        />
        <IconButton
          onTouchTap={() => this.input && this.input.click()}
        >
          <FileFolderOpen color={palette.secondaryTextColor} />
        </IconButton>
      </div>
    );
  }
}
