import React, {PropTypes, Component} from 'react';
import {FlatButton, DropDownMenu, MenuItem} from 'material-ui';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import HardwareKeyboardTab from 'material-ui/svg-icons/hardware/keyboard-tab';

import ToggleIcon from './ToggleIcon';


export default class Menu extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    handleRun: PropTypes.func.isRequired,
    handleDownload: PropTypes.func.isRequired,
    toggleTabVisible: PropTypes.func.isRequired,
    style: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { handleRun, handleDownload, toggleTabVisible } = this.props;

    const style = Object.assign({
      display: 'flex',
      flexDirection: 'row-reverse',
    }, this.props.style);

    return (
      <div style={style}>
        <FlatButton icon={<PowerSettingsNew />} onClick={handleRun} />
        <ToggleIcon
          enable={<HardwareKeyboardTab />}
          disable={<HardwareKeyboardTab />}
          onChange={toggleTabVisible}
        />
        <FlatButton icon={<FileDownload />} onClick={handleDownload} />
      </div>
    );
  }
}
