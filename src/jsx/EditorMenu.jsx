import React, { Component, PropTypes } from 'react';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import { minBlack } from 'material-ui/styles/colors';
import HardwareKeyboardTab from 'material-ui/svg-icons/hardware/keyboard-tab';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import ImageFilterBAndW from 'material-ui/svg-icons/image/filter-b-and-w';


const getStyles = (props, context) => {

  return {
    root: {
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 100,
    },
    button: {
      marginLeft: -12,
      marginTop: -4,
      padding: 0,
    },
    menu: {
      minWidth: 300,
    }
  }
};


export default class EditorMenu extends Component {

  static propTypes = {
    editorOptions: PropTypes.object.isRequired,
    handleEditorOptionChange: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  toggleOption = (propName) => {
    const current = this.props.editorOptions[propName];
    this.props.handleEditorOptionChange({ [propName]: !current });
  };

  render() {
    const {
      tabVisibility,
      darkness,
    } = this.props.editorOptions;

    const { root, button, menu } = getStyles(this.props, this.context);

    return (
        <IconMenu
          iconButtonElement={(
            <IconButton style={button}><ActionSettings color={minBlack} /></IconButton>
          )}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          style={root}
          menuStyle={menu}
        >
          <MenuItem
            rightIcon={<HardwareKeyboardTab />}
            primaryText="Tab Visibility"
            onTouchTap={() => this.toggleOption('tabVisibility')}
            checked={tabVisibility}
          />
          <MenuItem
            rightIcon={<ImageFilterBAndW />}
            primaryText="Darkness"
            onTouchTap={() => this.toggleOption('darkness')}
            checked={darkness}
          />
        </IconMenu>
    );
  }
}
