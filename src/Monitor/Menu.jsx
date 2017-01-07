import React, { PropTypes, Component } from 'react';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import FileCloudUpload from 'material-ui/svg-icons/file/cloud-upload';
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import ImagePalette from 'material-ui/svg-icons/image/palette';
import ImageTune from 'material-ui/svg-icons/image/tune';
import ActionLanguage from 'material-ui/svg-icons/action/language';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';


import { BinaryFile, SourceFile } from '../File/';
import getLocalization, { acceptedLanguages } from '../localization/';
import PaletteDialog from './PaletteDialog';
import EnvDialog from './EnvDialog';
import AboutDialog from './AboutDialog';
import CloneDialog from './CloneDialog';

export const MenuHeight = 40;

const getStyles = (props, context) => {

  const { isPopout } = props;
  const { palette } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'row-reverse',
      alignItems: 'center',
      height: MenuHeight,
      zIndex: 101,
      backgroundColor: palette.primary1Color,
    },
    button: {
      marginRight: 20,
      zIndex: 2,
    },
    popoutIcon: {
      transform: isPopout ? 'rotate(180deg)' : '',
    },
  };
};

export default class Menu extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    togglePopout: PropTypes.func.isRequired,
    monitorWidth: PropTypes.number.isRequired,
    monitorHeight: PropTypes.number.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  get title() {
    return (this.props.getConfig('env').TITLE || [''])[0];
  }

  handleClone = () => {
    this.props.openFileDialog(CloneDialog, {
      coreString: this.props.coreString,
      files: this.props.files,
      saveAs: this.props.saveAs,
    });
  };

  handlePalette = () => {
    const { openFileDialog } = this.props;

    openFileDialog(PaletteDialog);
  };

  handleEnv = () => {
    const { openFileDialog } = this.props;

    openFileDialog(EnvDialog);
  };

  handleAbout = () => {
    this.props.openFileDialog(AboutDialog, {
      files: this.props.files,
    });
  };

  handleDeploy = () => {
    const task = (event) => {
      if (event.source === popout) {
        window.removeEventListener('message', task);
        const [port] = event.ports;
        const provider = event.data;

        this.props.setConfig('provider', JSON.parse(provider))
          .then(() => Promise.all( this.props.files.map((file) => file.compose()) ))
          .then((files) => SourceFile.embed({
            files,
            TITLE: this.title,
            coreString: this.props.coreString,
          }))
          .then((html) => port.postMessage(html.text));
      }
    };

    window.addEventListener('message', task);

    const popout = window.open(
      this.props.getConfig('provider').publishUrl,
      '_blank',
      'width=400,height=400');

    if (popout) {
      window.addEventListener('unload', () => popout.close());
    }
  };

  render() {
    const {
      isPopout,
      togglePopout,
      localization: { menu },
      setLocalization,
      getConfig,
    } = this.props;

    const {
      root,
      button,
      popoutIcon,
    } = getStyles(this.props, this.context);

    const {
      prepareStyles,
      palette: { alternateTextColor }
    } = this.context.muiTheme;

    const canDeploy = !!getConfig('provider').publishUrl;

    return (
      <Paper
        rounded={false}
        style={root}
      >
        <IconMenu
          iconButtonElement={(
            <IconButton tooltip={menu.language}>
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
          tooltip={menu.palette}
          onTouchTap={this.handlePalette}
          style={button}
        >
          <ImagePalette color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={menu.env}
          onTouchTap={this.handleEnv}
          style={button}
        >
          <ImageTune color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={menu.popout}
          onTouchTap={togglePopout}
          style={button}
          iconStyle={popoutIcon}
        >
          <OpenInBrowser color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={menu.clone}
          disabled={!this.props.coreString}
          onTouchTap={this.handleClone}
          style={button}
        >
          <FileDownload color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={menu.aboutFeeles}
          onTouchTap={this.handleAbout}
          style={button}
        >
          <ActionAssignment color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={menu.deploy}
          disabled={!canDeploy || !this.props.coreString}
          onTouchTap={this.handleDeploy}
          style={button}
        >
          <FileCloudUpload color={alternateTextColor} />
        </IconButton>
      </Paper>
    );
  }
}
