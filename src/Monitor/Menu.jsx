import React, { PropTypes, Component } from 'react';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import ImagePalette from 'material-ui/svg-icons/image/palette';
import ImageTune from 'material-ui/svg-icons/image/tune';
import ActionLanguage from 'material-ui/svg-icons/action/language';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import 'whatwg-fetch';


import getLocalization, { acceptedLanguages } from '../localization/';
import { DownloadDialog, SaveDialog } from '../FileDialog/';
import PaletteDialog from './PaletteDialog';
import EnvDialog from './EnvDialog';
import AboutDialog from './AboutDialog';

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
      backgroundColor: palette.primary1Color,
      zIndex: 100,
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
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    togglePopout: PropTypes.func.isRequired,
    palette: PropTypes.object.isRequired,
    env: PropTypes.object.isRequired,
    updatePalette: PropTypes.func.isRequired,
    updateEnv: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    hover: PropTypes.bool.isRequired,
    onMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  // handlePowerOff = () => {
  //   this.props.player.close();
  // };

  handleDownload = () => {
    const { files, env, openFileDialog } = this.props;

    openFileDialog(DownloadDialog, { files, env })
      .then(content => {
        openFileDialog(SaveDialog, {
          content,
          defaultType: 'text/html'
        });
      })
      .catch((err) => alert(err.message));
  };

  handlePalette = () => {
    const { openFileDialog, palette, updatePalette } = this.props;

    openFileDialog(PaletteDialog, { palette, updatePalette });
  };

  handleEnv = () => {
    const { openFileDialog, env, updateEnv } = this.props;

    openFileDialog(EnvDialog, { env, updateEnv });
  };

  handleAbout = () => {
    const { openFileDialog } = this.props;

    openFileDialog(AboutDialog);
  };

  render() {
    const {
      isPopout,
      togglePopout,
      options: { unlimited },
      localization: { menu },
      setLocalization,
      hover,
      onMouseEnter,
      onMouseLeave,
    } = this.props;

    const {
      root,
      button,
      popoutIcon
    } = getStyles(this.props, this.context);

    const {
      prepareStyles,
      palette: { alternateTextColor }
    } = this.context.muiTheme;

    const tooltipPosition = unlimited ? 'bottom-center' : 'top-center';

    return (
      <Paper
        rounded={false}
        zDepth={hover ? 2 : 1}
        style={root}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {null /*
        <IconButton
          tooltip={menu.shutdown}
          onTouchTap={this.handlePowerOff}
          tooltipPosition={tooltipPosition}
          style={button}
        >
          <PowerSettingsNew color={alternateTextColor} />
        </IconButton>
        */}
      {unlimited ? (
        <IconButton
          tooltip={menu.popout}
          onTouchTap={togglePopout}
          tooltipPosition={tooltipPosition}
          style={button}
          iconStyle={popoutIcon}
        >
          <OpenInBrowser color={alternateTextColor} />
        </IconButton>
      ) : null}
        <IconButton
          tooltip={menu.palette}
          onTouchTap={this.handlePalette}
          tooltipPosition={tooltipPosition}
          style={button}
        >
          <ImagePalette color={alternateTextColor} />
        </IconButton>
      {unlimited ? (
        <IconButton
          tooltip={menu.env}
          onTouchTap={this.handleEnv}
          tooltipPosition={tooltipPosition}
          style={button}
        >
          <ImageTune color={alternateTextColor} />
        </IconButton>
      ) : null}
        <IconMenu
          iconButtonElement={(
            <IconButton
              tooltip={menu.language}
              tooltipPosition={tooltipPosition}
            >
              <ActionLanguage color={alternateTextColor} />
            </IconButton>
          )}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          style={button}
        >
        {acceptedLanguages.map(lang => (
          <MenuItem
            key={lang.accept[0]}
            primaryText={lang.native}
            onTouchTap={() => setLocalization(
              getLocalization(lang.accept[0])
            )}
          />
        ))}
        </IconMenu>
        <IconButton
          tooltip={menu.download}
          onTouchTap={this.handleDownload}
          tooltipPosition={tooltipPosition}
          style={button}
        >
          <FileDownload color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={menu.aboutFeeles}
          onTouchTap={this.handleAbout}
          tooltipPosition={tooltipPosition}
          style={button}
        >
          <ActionAssignment color={alternateTextColor} />
        </IconButton>
      </Paper>
    );
  }
}
