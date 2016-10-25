import React, { PropTypes, Component } from 'react';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
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

const getStyles = (props, context) => {

  const { isPopout } = props;
  const { palette } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'row-reverse',
      alignItems: 'center',
      height: 40,
      backgroundColor: palette.accent1Color,
      zIndex: 1,
    },
    button: {
      marginRight: 20
    },
    popoutIcon: {
      transform: isPopout ? 'rotate(180deg)' : '',
    }
  };
};

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

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
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

    const { root, button, popoutIcon } = getStyles(this.props, this.context);
    const { prepareStyles, palette: { alternateTextColor } } = this.context.muiTheme;

    return (
      <Paper style={root}>
        <IconButton tooltip="RUN" onTouchTap={handleRun} style={button}>
          <PlayCircleOutline color={alternateTextColor} />
        </IconButton>
        <IconButton tooltip="Shut down" onTouchTap={this.handlePowerOff} style={button}>
          <PowerSettingsNew color={alternateTextColor} />
        </IconButton>
        <IconButton tooltip="Download" onTouchTap={this.handleDownload} style={button}>
          <FileDownload color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={isPopout ? "Inside" : "New window"}
          onTouchTap={handleTogglePopout}
          style={button}
          iconStyle={popoutIcon}
        >
          <OpenInBrowser color={alternateTextColor} />
        </IconButton>
        <IconButton tooltip="Colors" onTouchTap={this.handlePalette} style={button}>
          <ImagePalette color={alternateTextColor} />
        </IconButton>
        <IconButton tooltip="Configure Env" onTouchTap={this.handleEnv} style={button}>
          <ImageTune color={alternateTextColor} />
        </IconButton>
      </Paper>
    );
  }
}
