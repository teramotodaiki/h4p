import React, { PropTypes, PureComponent } from 'react';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import FileCloudUpload from 'material-ui/svg-icons/file/cloud-upload';
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import ActionLanguage from 'material-ui/svg-icons/action/language';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';


import { BinaryFile, SourceFile } from '../File/';
import getLocalization, { acceptedLanguages } from '../localization/';
import AboutDialog from './AboutDialog';
import CloneDialog from './CloneDialog';


const getStyles = (props, context) => {

  const {
    isPopout,
    showMonitor
  } = props;
  const { palette } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      alignItems: 'center',
      zIndex: 400,
      backgroundColor: showMonitor ?
         palette.accent1Color : palette.primary1Color,
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

export default class Menu extends PureComponent {

  static propTypes = {
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    togglePopout: PropTypes.func.isRequired,
    monitorWidth: PropTypes.number.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
    showMonitor: PropTypes.bool.isRequired,
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

  handleAbout = () => {
    this.props.openFileDialog(AboutDialog, {
      files: this.props.files,
    });
  };

  handleDeploy = () => {
    const task = async (event) => {
      if (event.source === popout) {
        window.removeEventListener('message', task);
        const [port] = event.ports;
        const provider = event.data;

        await this.props.setConfig('provider', JSON.parse(provider));

        const html = await SourceFile.embed({
          files: this.props.files,
          TITLE: this.title,
          coreString: this.props.coreString,
        });

        port.postMessage(html.text);
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
      <div style={root}>
        <IconMenu
          iconButtonElement={(
            <IconButton
              tooltipPosition="top-center"
              tooltip={menu.language}
            >
              <ActionLanguage color={alternateTextColor} />
            </IconButton>
          )}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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
          tooltipPosition="top-center"
          tooltip={menu.popout}
          onTouchTap={togglePopout}
          style={button}
          iconStyle={popoutIcon}
        >
          <OpenInBrowser color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltipPosition="top-center"
          tooltip={menu.clone}
          disabled={!this.props.coreString}
          onTouchTap={this.handleClone}
          style={button}
        >
          <FileDownload color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltipPosition="top-center"
          tooltip={menu.aboutFeeles}
          onTouchTap={this.handleAbout}
          style={button}
        >
          <ActionAssignment color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltipPosition="top-center"
          tooltip={menu.deploy}
          disabled={!canDeploy || !this.props.coreString}
          onTouchTap={this.handleDeploy}
          style={button}
        >
          <FileCloudUpload color={alternateTextColor} />
        </IconButton>
      </div>
    );
  }
}
