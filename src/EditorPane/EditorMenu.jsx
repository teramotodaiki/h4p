import React, { Component, PropTypes } from 'react';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import { minBlack } from 'material-ui/styles/colors';
import HardwareKeyboardTab from 'material-ui/svg-icons/hardware/keyboard-tab';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import ImageFilterBAndW from 'material-ui/svg-icons/image/filter-b-and-w';
import EditorWrapText from 'material-ui/svg-icons/editor/wrap-text';
import AvWeb from 'material-ui/svg-icons/av/web';
import EditorFormatIndentIncrease from 'material-ui/svg-icons/editor/format-indent-increase';


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
    options: PropTypes.object.isRequired,
    handleOptionChange: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  toggleOption = (propName) => {
    const current = this.props.options[propName];
    this.props.handleOptionChange({ [propName]: !current });
  };

  render() {
    const {
      options,
      localization: { editorMenu },
    } = this.props;

    const { root, button, menu } = getStyles(this.props, this.context);
    const { secondaryTextColor } = this.context.muiTheme.palette;

    return (
        <IconMenu
          iconButtonElement={(
            <IconButton style={button}>
              <ActionSettings color={secondaryTextColor} />
            </IconButton>
          )}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          style={root}
          menuStyle={menu}
        >
          <MenuItem
            rightIcon={<AvWeb />}
            primaryText={editorMenu.unlimited}
            onTouchTap={() => this.toggleOption('unlimited')}
            checked={options.unlimited}
          />
          <MenuItem
            rightIcon={<EditorWrapText />}
            primaryText={editorMenu.lineWrapping}
            onTouchTap={() => this.toggleOption('lineWrapping')}
            checked={options.lineWrapping}
          />
          <MenuItem
            rightIcon={<HardwareKeyboardTab />}
            primaryText={editorMenu.tabVisibility}
            onTouchTap={() => this.toggleOption('tabVisibility')}
            checked={options.tabVisibility}
          />
          <MenuItem
            rightIcon={<ImageFilterBAndW />}
            primaryText={editorMenu.darkness}
            onTouchTap={() => this.toggleOption('darkness')}
            checked={options.darkness}
          />
          <MenuItem
            rightIcon={<EditorFormatIndentIncrease />}
            primaryText={editorMenu.indentUnit4}
            onTouchTap={() => this.toggleOption('indentUnit4')}
            checked={options.indentUnit4}
          />
        </IconMenu>
    );
  }
}
