import React, { PropTypes, Component } from 'react';
import { IconButton } from 'material-ui';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import PlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';
import 'whatwg-fetch';

import { DialogTypes } from './FileDialog/';

export default class Menu extends Component {

  static propTypes = {
    player: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    handleRun: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
  };

  handlePowerOff = () => {
    this.props.player.close();
  };

  handleDownload = () => {
    const { files, openFileDialog } = this.props;

    openFileDialog(DialogTypes.Download, { files })
      .then(content => {
        openFileDialog(DialogTypes.Save, { content });
      })
      .catch((err) => alert(err.message));
  };

  render() {
    const { handleRun } = this.props;

    const style = Object.assign({
      display: 'flex',
      flexDirection: 'row-reverse',
    }, this.props.style);

    const iconStyle = {
      marginRight: 20
    };

    return (
      <div style={style}>
        <IconButton tooltip="RUN" onClick={handleRun} style={iconStyle}>
          <PlayCircleOutline />
        </IconButton>
        <IconButton tooltip="Shut down" onClick={this.handlePowerOff} style={iconStyle}>
          <PowerSettingsNew />
        </IconButton>
        <IconButton tooltip="Download" onClick={this.handleDownload} style={iconStyle}>
          <FileDownload />
        </IconButton>
      </div>
    );
  }
}
