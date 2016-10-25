import React, { Component, PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';
import PlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { transparent } from 'material-ui/styles/colors';
import { emphasize } from 'material-ui/utils/colorManipulator';


const getStyles = (props, context) => {

  const {
    textColor
  } = context.muiTheme.palette;

  const tabHeight = 32;
  const sizerWidth = 24;

  return {
    root: {
      display: 'flex',
      alignItems: 'flex-end',
      boxSizing: 'border-box',
      height: 40,
      paddingTop: 8,
      paddingRight: tabHeight / 4,
      paddingLeft: tabHeight / 4,
      marginLeft: sizerWidth,
      overflowX: 'scroll',
      overflowY: 'hidden',
    },
    item: {
      height: 0,
      marginLeft: - tabHeight / 4,
      marginRight: - tabHeight / 4,
      borderTopWidth: 0,
      borderRightWidth: tabHeight / 2,
      borderBottomWidth: tabHeight,
      borderLeftWidth: tabHeight / 2,
      borderStyle: 'solid',
      borderLeftColor: transparent,
      borderRightColor: transparent,
    },
    innerItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: -tabHeight / 4,
      marginRight: tabHeight / 4,
      marginBottom: 0,
      marginLeft: tabHeight / 4,
    },
    leftButton: {
      flex: '0 0 auto',
      padding: 0,
      marginLeft: -24,
      marginRight: -10,
      transform: 'scale(0.8)',
    },
    label: {
      color: textColor,
      textDecoration: 'none',
      textOverflow: 'ellipsis',
      overflowX: 'hidden',
      maxWidth: 96,
      minWidth: 32,
      whiteSpace: 'nowrap',
      fontSize: '.8em',
      cursor: 'default',
    },
    rightButton: {
      padding: 0,
      marginLeft: -10,
      marginRight: -24,
      transform: 'scale(0.55)',
    }
  };
};

const TAB_CONTAINER = CSS_PREFIX + 'tab_container';
const TAB_ITEM = CSS_PREFIX + 'tab';
const TAB_ACTIVE = CSS_PREFIX + 'tab-active';

export default class ChromeTabs extends Component {

  static propTypes = {
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    handleSelect: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  renderItem(file, styles) {
    const {
      selectedFile,
      handleSelect,
      handleClose,
      handleRun,
    } = this.props;

    const {
      palette: {
        canvasColor,
        textColor,
      },
      prepareStyles,
    } = this.context.muiTheme;

    const active = file === selectedFile;
    const item = Object.assign({}, styles.item, {
      borderTopColor: active ? canvasColor : emphasize(canvasColor),
      borderBottomColor: active ? canvasColor : emphasize(canvasColor),
      zIndex: active ? 2 : 1,
    });

    const handleLeftTouchTap = (e) => {
      e.stopPropagation();
      handleRun();
    };

    const handleRightTouchTap = (e) => {
      e.stopPropagation();
      handleClose(file);
    };

    return (
      <div key={file.key} style={prepareStyles(item)}>
        <div
          style={prepareStyles(styles.innerItem)}
          onTouchTap={() => handleSelect(file)}
        >
        {file.options.isEntryPoint ? (
          <IconButton
            style={styles.leftButton}
            onTouchTap={handleLeftTouchTap}
          >
            <PlayCircleOutline color={textColor} />
          </IconButton>
        ) : null}
          <a
            href="#"
            style={prepareStyles(styles.label)}
            title={file.moduleName}
          >
          {file.moduleName}
          </a>
          <IconButton
            style={styles.rightButton}
            onTouchTap={handleRightTouchTap}
          >
            <NavigationClose color={textColor} />
          </IconButton>
        </div>
      </div>
    );
  }

  render() {
    const {
      selectedFile,
      tabbedFiles,
      handleSelect,
      handleClose,
      handleRun,
    } = this.props;

    const styles = getStyles(this.props, this.context);
    const { prepareStyles } = this.context.muiTheme;

    return (
      <div style={prepareStyles(styles.root)}>
      {tabbedFiles.map(file => this.renderItem(file, styles))}
      </div>
    );
  }
}
