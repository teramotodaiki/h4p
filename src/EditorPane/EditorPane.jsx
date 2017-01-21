import React, { PropTypes, PureComponent } from 'react';
import IconButton from 'material-ui/IconButton';
import AVPlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';
import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert';
import transitions from 'material-ui/styles/transitions';


import { SourceFile } from '../File/';
import EditorMenu from './EditorMenu';
import ChromeTab, { ChromeTabContent } from '../ChromeTab/';
import codemirrorStyle from './codemirror-style';

const MAX_TAB = 16;

const getStyles = (props, context) => {
  const {
    palette,
    spacing,
    fontFamily,
  } = context.muiTheme;

  return {
    root: {
      flex: props.show ? '1 1 auto' : '0 0 0',
      opacity: props.show ? 1 : 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      overflow: 'hidden',
      fontFamily,
      transition: transitions.easeOut(),
    },
    tabContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      height: 32,
      paddingTop: spacing.desktopGutterMini,
      paddingRight: spacing.desktopGutterLess,
      paddingBottom: 10,
      paddingLeft: 10,
      marginRight: spacing.desktopGutterMore,
      marginBottom: -10,
      overflow: 'hidden',
      zIndex: 10,
    },
    tabContentContainer: {
      flex: '1 1 auto',
      position: 'relative',
    },
  };
};

export default class EditorPane extends PureComponent {

  static propTypes = {
    show: PropTypes.bool.isRequired,
    files: PropTypes.array.isRequired,
    tabs: PropTypes.array.isRequired,
    putFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    port: PropTypes.object,
    reboot: PropTypes.bool.isRequired,
    toggleMonitor: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.isResizing) {
      return false;
    }
    if (!this.props.show && !nextProps.show) {
      return false;
    }
    return true;
  }

  renderBackground() {
    const {
      localization,
    } = this.props;
    const {
      palette,
    } = this.context.muiTheme;

    const styles = {
      noFileBg: {
        flex: '1 1 auto',
        backgroundColor: palette.primary1Color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      logo: {
        color: palette.secondaryTextColor,
      },
      largeIcon: {
        width: 40,
        height: 40,
      },
      large: {
        width: 80,
        height: 80,
        padding: 20,
      },
    };

    return (
      <div style={styles.noFileBg}>
        <h1 style={styles.logo}>Feeles</h1>
        <IconButton
          iconStyle={styles.largeIcon}
          style={styles.large}
          onTouchTap={this.props.setLocation}
        >
          <AVPlayCircleOutline color={palette.alternateTextColor} />
        </IconButton>
      </div>
    );
  }

  getFiles = () => this.props.files;

  handleCloseSelectedTab = () => {
    this.props.tabs
      .filter((item) => item.isSelected)
      .forEach((item) => this.props.closeTab(item));
  };

  handleSelectTabFromFile = (file) => {
    this.props.tabs
      .filter((item) => item.file.key === file.key)
      .forEach((item) => this.props.selectTab(item));
  };

  render() {
    if (!this.props.tabs.length && this.props.show) {
      return this.renderBackground();
    }

    const {
      files, tabs,
      putFile, selectTab, closeTab,
      openFileDialog,
      localization,
      findFile,
      getConfig, setConfig,
      port,
      reboot,
    } = this.props;
    const {
      prepareStyles,
      palette,
    } = this.context.muiTheme;

    const {
      root,
      tabContainer,
      tabContentContainer,
      button,
    } = getStyles(this.props, this.context);

    const styleSwap = {
      position: 'absolute',
      right: 0,
    };

    const userStyle = findFile('feeles/codemirror.css');

    return (
    <div style={prepareStyles(root)}>
      <style>{codemirrorStyle(this.context.muiTheme.palette)}</style>
    {userStyle ? (
      <style>{userStyle.text}</style>
    ) : null}
      <IconButton style={styleSwap} onTouchTap={this.props.toggleMonitor}>
        <ActionSwapVert />
      </IconButton>
      <div style={prepareStyles(tabContainer)}>
      {tabs.slice(0, MAX_TAB).map((tab) => (
        <ChromeTab
          key={tab.key}
          tab={tab}
          file={tab.file}
          length={tabs.length}
          isSelected={tab.isSelected}
          localization={localization}
          handleSelect={selectTab}
          handleClose={closeTab}
        />
      ))}
      </div>
      <div style={tabContentContainer}>
      {tabs.map((tab) => (
        <ChromeTabContent key={tab.key} show={tab.isSelected}>
        {tab.renderContent({
          getFiles: this.getFiles,
          closeSelectedTab: this.handleCloseSelectedTab,
          selectTabFromFile: this.handleSelectTabFromFile,
          setLocation: this.props.setLocation,
          href: this.props.href,
          getConfig,
          findFile,
          localization,
          port,
          reboot,
          openFileDialog,
          putFile,
        })}
        </ChromeTabContent>
      ))}
      </div>
    </div>
    );
  }
}
