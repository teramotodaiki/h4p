import React, { Component, PropTypes } from 'react';
import { IconMenu, IconButton, MenuItem } from 'material-ui';
import { minBlack } from 'material-ui/styles/colors';
import HardwareKeyboardTab from 'material-ui/svg-icons/hardware/keyboard-tab';
import ActionSettings from 'material-ui/svg-icons/action/settings';


export default class EditorMenu extends Component {

  static propTypes = {
    editorOptions: PropTypes.object.isRequired,
    handleEditorOptionChange: PropTypes.func.isRequired,
  };

  toggleTabVisibility = () => {
    const { tabVisibility } = this.props.editorOptions;
    this.props.handleEditorOptionChange({ tabVisibility: !tabVisibility });
  };

  render() {
    const { tabVisibility } = this.props.editorOptions;

    const style = Object.assign({
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: 100
    }, this.props.style);

    const iconStyle = {
      margin: -10,
      padding: 0,
    };

    return (
        <IconMenu
          iconButtonElement={<IconButton style={iconStyle}><ActionSettings color={minBlack} /></IconButton>}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          style={style}
        >
          <MenuItem
            rightIcon={<HardwareKeyboardTab />}
            primaryText="Tab Visibility"
            onTouchTap={this.toggleTabVisibility}
            checked={tabVisibility}
          />
        </IconMenu>
    );
  }
}
