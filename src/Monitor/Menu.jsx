import React, { PropTypes, Component } from 'react';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import { transparent } from 'material-ui/styles/colors';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import FileCloudUpload from 'material-ui/svg-icons/file/cloud-upload';
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import ImagePalette from 'material-ui/svg-icons/image/palette';
import ImageTune from 'material-ui/svg-icons/image/tune';
import ActionLanguage from 'material-ui/svg-icons/action/language';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';


import { BinaryFile, ConfigFile, SourceFile } from '../File/';
import getLocalization, { acceptedLanguages } from '../localization/';
import { DownloadDialog, SaveDialog } from '../FileDialog/';
import PaletteDialog from './PaletteDialog';
import EnvDialog from './EnvDialog';
import AboutDialog from './AboutDialog';
import { compose } from '../js/files';
import download from '../html/download';
import SizerDragSource from './SizerDragSource';

export const MenuHeight = 40;

const getStyles = (props, context) => {

  const { isPopout } = props;
  const { palette } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      zIndex: 100,
    },
    bar: {
      display: 'flex',
      flexDirection: 'row-reverse',
      alignItems: 'center',
      height: MenuHeight,
      backgroundColor: transparent,
    },
    button: {
      marginRight: 20,
      zIndex: 2,
    },
    popoutIcon: {
      transform: isPopout ? 'rotate(180deg)' : '',
    },
    preview: {
      position: 'absolute',
      bottom: 0,
      backgroundColor: palette.primary1Color,
      height: MenuHeight,
      width: '100%',
      zIndex: 1,
    },
  };
};

class Menu extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    togglePopout: PropTypes.func.isRequired,
    palette: PropTypes.object.isRequired,
    env: PropTypes.object.isRequired,
    updatePalette: PropTypes.func.isRequired,
    updateEnv: PropTypes.func.isRequired,
    monitorWidth: PropTypes.number.isRequired,
    monitorHeight: PropTypes.number.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
    hover: PropTypes.bool.isRequired,
    onMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
    tooltipPosition: PropTypes.string.isRequired,
    canDeploy: PropTypes.bool.isRequired,
    provider: PropTypes.object,
    onSizer: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  componentWillReceiveProps(nextProps) {
    const { isDragging, onSizer } = this.props;

    if (!isDragging && nextProps.isDragging) {
      onSizer(true);
    } else if (isDragging && !nextProps.isDragging) {
      onSizer(false);
    }
  }

  handleDownload = () => {
    const { env, openFileDialog } = this.props;

    openFileDialog(DownloadDialog, { env, bundle: this.bundle })
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

    openFileDialog(AboutDialog, {
      bundle: this.bundle,
    });
  };

  handleDeploy = () => {
    const task = (event) => {
      if (event.source === popout) {
        window.removeEventListener('message', task);
        const [port] = event.ports;
        const provider = event.data;

        this.bundle({ provider })
          .then((html) => port.postMessage(html));
      }
    };

    window.addEventListener('message', task);

    const popout = window.open(
      this.props.provider.publishUrl,
      '_blank',
      'width=400,height=400');

    if (popout) {
      window.addEventListener('unload', () => popout.close());
    }
  };

  bundle = (config) => {
    const { env, provider } = this.props;
    const [TITLE] = env.TITLE || [''];

    return Promise.all(
      this.props.files.map((file) => file.compose())
    )
    .then(([...files]) => Object.assign({
      useCDN: true,
      files,
      EXPORT_VAR_NAME,
      CSS_PREFIX,
      CORE_CDN_URL,
      TITLE,
      provider: JSON.stringify(provider),
    }, config))
    .then(download);
  };

  render() {
    const {
      isPopout,
      togglePopout,
      localization: { menu },
      setLocalization,
      hover,
      onMouseEnter,
      onMouseLeave,
      tooltipPosition,
      canDeploy,

      connectDragSource,
      connectDragPreview,
    } = this.props;

    const {
      root,
      bar,
      button,
      popoutIcon,
      preview,
    } = getStyles(this.props, this.context);

    const {
      prepareStyles,
      palette: { alternateTextColor }
    } = this.context.muiTheme;

    return connectDragSource(
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={prepareStyles(root)}
    >
      <Paper
        rounded={false}
        zDepth={hover ? 2 : 1}
        style={bar}
      >
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
          tooltip={menu.palette}
          onTouchTap={this.handlePalette}
          tooltipPosition={tooltipPosition}
          style={button}
        >
          <ImagePalette color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={menu.env}
          onTouchTap={this.handleEnv}
          tooltipPosition={tooltipPosition}
          style={button}
        >
          <ImageTune color={alternateTextColor} />
        </IconButton>
        <IconButton
          tooltip={menu.popout}
          onTouchTap={togglePopout}
          tooltipPosition={tooltipPosition}
          style={button}
          iconStyle={popoutIcon}
        >
          <OpenInBrowser color={alternateTextColor} />
        </IconButton>
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
        {canDeploy ? (
          <IconButton
            tooltip={menu.deploy}
            onTouchTap={this.handleDeploy}
            tooltipPosition={tooltipPosition}
            style={button}
          >
            <FileCloudUpload color={alternateTextColor} />
          </IconButton>
        ) : null}
      </Paper>
    {connectDragPreview(
      <div style={prepareStyles(preview)} />
    )}
  </div>);
  }
}


export default SizerDragSource(Menu);
