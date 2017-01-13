import React, { PropTypes, PureComponent } from 'react';
import IconButton from 'material-ui/IconButton';
import AVPlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';


import { SourceFile } from '../File/';
import EditorMenu from './EditorMenu';
import ChromeTab, { ChromeTabContent } from '../ChromeTab/';


const getStyles = (props, context) => {
  const {
    palette,
    spacing,
    fontFamily,
  } = context.muiTheme;

  return {
    root: {
      flex: props.showMonitor ? '0 0 0' : '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      overflow: 'hidden',
      fontFamily,
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
    showMonitor: PropTypes.bool.isRequired,
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
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.isResizing) {
      return false;
    }
    if (this.props.showMonitor && nextProps.showMonitor) {
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
          onTouchTap={this.handleRun}
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

  handleRun = () => {
    this.props.setLocation({});
  };

  render() {
    if (!this.props.tabs.length && !this.props.showMonitor) {
      return this.renderBackground();
    }

    const {
      files, tabs,
      putFile, selectTab, closeTab,
      handleRun,
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

    return (
    <div style={prepareStyles(root)}>
    {this.props.showMonitor ? null : (
      <EditorMenu
        files={files}
        localization={localization}
        getConfig={getConfig}
        setConfig={setConfig}
      />
    )}
      <div style={prepareStyles(tabContainer)}>
      {tabs.map((tab) => (
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
          handleRun: this.handleRun,
          closeSelectedTab: this.handleCloseSelectedTab,
          selectTabFromFile: this.handleSelectTabFromFile,
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
