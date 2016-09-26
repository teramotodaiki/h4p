import React, {PropTypes, Component} from 'react';
import {FlatButton, DropDownMenu, MenuItem} from 'material-ui';
import WebAsset from 'material-ui/svg-icons/av/web-asset';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';

import HardwareKeyboardTab from 'material-ui/svg-icons/hardware/keyboard-tab';

import ToggleIcon from './ToggleIcon';


export default class Menu extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    handleRun: PropTypes.func.isRequired,
    toggleTabVisible: PropTypes.func.isRequired,
    style: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { style, handleRun, toggleTabVisible } = this.props;

    const rotate = (deg) => ({ transform: `rotate(${deg}deg)` });

    return (
      <div style={style}>
        <FlatButton icon={<PowerSettingsNew />} onClick={handleRun}></FlatButton>
        <ToggleIcon
          enable={<HardwareKeyboardTab />}
          disable={<HardwareKeyboardTab />}
          onChange={toggleTabVisible}
        />
      </div>
    );
  }
}
