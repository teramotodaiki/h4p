import React, { PropTypes, Component } from 'react';
import IconButton from 'material-ui/IconButton';
import { darkBlack } from 'material-ui/styles/colors';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import PlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import ImagePalette from 'material-ui/svg-icons/image/palette';
import ImageTune from 'material-ui/svg-icons/image/tune';
import 'whatwg-fetch';

import { DownloadDialog, SaveDialog } from './FileDialog/';
import CustomDialog from './CustomDialog';
import EnvDialog from './EnvDialog';

export default class Menu extends Component {

  static propTypes = {
    player: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    handleRun: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    handleTogglePopout: PropTypes.func.isRequired,
    palette: PropTypes.object.isRequired,
    env: PropTypes.array.isRequired,
    updatePalette: PropTypes.func.isRequired,
    updateEnv: PropTypes.func.isRequired,
  };

  handlePowerOff = () => {
    this.props.player.close();
  };

  handleDownload = () => {
    const { files, env, openFileDialog } = this.props;

    openFileDialog(DownloadDialog, { files, env })
      .then(content => {
        openFileDialog(SaveDialog, { content });
      })
      .catch((err) => alert(err.message));
  };

  handlePalette = () => {
    const { openFileDialog, palette, updatePalette } = this.props;

    openFileDialog(CustomDialog, { palette, updatePalette });
  };

  handleEnv = () => {
    const { openFileDialog, env, updateEnv } = this.props;

    openFileDialog(EnvDialog, { env, updateEnv });
  };

  render() {
    const { isPopout, handleRun, handleTogglePopout } = this.props;

    const iconStyle = {
      marginRight: 20
    };

    const style = Object.assign({}, this.props.style, {
      zIndex: 1,
    });

    return (
      <div className={CSS_PREFIX + 'menu'} style={style}>
        <IconButton tooltip="RUN" onTouchTap={handleRun} style={iconStyle}>
          <PlayCircleOutline color={darkBlack} />
        </IconButton>
        <IconButton tooltip="Shut down" onTouchTap={this.handlePowerOff} style={iconStyle}>
          <PowerSettingsNew color={darkBlack} />
        </IconButton>
        <IconButton tooltip="Download" onTouchTap={this.handleDownload} style={iconStyle}>
          <FileDownload color={darkBlack} />
        </IconButton>
        <IconButton
          tooltip={isPopout ? "Inside" : "New window"}
          onTouchTap={handleTogglePopout}
          style={iconStyle}
          iconStyle={isPopout ? { transform: 'rotate(180deg)' } : null}
        >
          <OpenInBrowser color={darkBlack} />
        </IconButton>
        <IconButton tooltip="Colors" onTouchTap={this.handlePalette} style={iconStyle}>
          <ImagePalette color={darkBlack} />
        </IconButton>
        <IconButton tooltip="Configure Env" onTouchTap={this.handleEnv} style={iconStyle}>
          <ImageTune color={darkBlack} />
        </IconButton>
      </div>
    );
  }
}
