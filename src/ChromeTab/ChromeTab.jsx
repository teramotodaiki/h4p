import React, { PureComponent, PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { transparent, redA200 } from 'material-ui/styles/colors';
import { emphasize, fade } from 'material-ui/utils/colorManipulator';


const MaxTabWidth = 160;
const MinTabWidth = 0;
const TabHeight = 32;
const TabSkewX = 24;

const getStyles = (props, context, state) => {
  const { isSelected } = props;
  const { palette, spacing, fontFamily } = context.muiTheme;
  const { containerStyle, closerMouseOver } = state;

  const tabHeight = TabHeight + (isSelected ? 1 : 0);
  const tabWidth = Math.min(MaxTabWidth, Math.max(MinTabWidth,
    parseInt(containerStyle.width) / props.length
  ));
  const blank = tabHeight / Math.tan((90 - TabSkewX) / 180 * Math.PI);
  const backgroundColor = fade(isSelected ?
    palette.canvasColor : emphasize(palette.canvasColor), 1
  );

  const blade = (left) => ({
    position: 'absolute',
    boxSizing: 'border-box',
    width: tabWidth - blank,
    height: tabHeight,
    left: left ? 0 : 'auto',
    right: left ? 'auto' : 0,
    borderTopWidth: left ? 0 : 1,
    borderRightWidth: left ? 0 : 1,
    borderBottomWidth: 0,
    borderLeftWidth: left ? 1 : 0,
    borderStyle: 'solid',
    borderColor: palette.primary1Color,
    transform: `skewX(${(left ? -1 : 1) * TabSkewX}deg)`,
    backgroundColor,
    zIndex: left ? 1 : 2,
  });

  return {
    root: {
      flex: '1 1 auto',
      position: 'relative',
      boxSizing: 'border-box',
      maxWidth: MaxTabWidth,
      height: tabHeight,
      marginBottom: isSelected ? -1 : 0,
      zIndex: isSelected ? 2 : 1,
      fontFamily,
    },
    left: blade(true),
    center: {
      position: 'absolute',
      width: tabWidth - blank,
      height: tabHeight,
      paddingLeft: blank / 2,
      paddingRight: blank / 2,
      zIndex: 3,
    },
    right: blade(false),
    innerItem: {
      display: 'flex',
      alignItems: 'center',
      height: tabHeight,
    },
    label: {
      flex: '1 1 auto',
      color: palette.textColor,
      textDecoration: 'none',
      overflowX: 'hidden',
      whiteSpace: 'nowrap',
      fontSize: '.8em',
      cursor: 'default',
    },
    rightButton: {
      flex: '0 0 auto',
      padding: 0,
      width: spacing.iconSize,
      height: spacing.iconSize,
      margin: '0 -4px',
      transform: 'scale(0.55)',
      borderRadius: '50%',
      backgroundColor: closerMouseOver ? redA200 : transparent,
    }
  };
};


export default class ChromeTabs extends PureComponent {

  static propTypes = {
    tab: PropTypes.object.isRequired,
    length: PropTypes.number.isRequired,
    isSelected: PropTypes.bool.isRequired,
    handleSelect: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    containerStyle: {
      width: 0,
    },
    closerMouseOver: false,
  };

  handleRef = (ref) => {
    if (!ref) return;
    const container = ref.parentNode;
    if (container) {
      const containerStyle = getComputedStyle(container);
      this.setState({ containerStyle });
    }
  };

  render() {
    const {
      tab,
      isSelected,
      handleSelect,
      handleClose,
    } = this.props;
    const {
      palette: {
        secondaryTextColor,
        alternateTextColor,
      },
      prepareStyles,
    } = this.context.muiTheme;
    const { closerMouseOver } = this.state;

    const styles = getStyles(this.props, this.context, this.state);

    const handleRightTouchTap = (e) => {
      e.stopPropagation();
      handleClose(tab);
    };

    const handleRightMouseEnter = (e) => {
      this.setState({ closerMouseOver: true });
    };

    const handleRightMouseLeave = (e) => {
      this.setState({ closerMouseOver: false });
    };

    const { file } = tab;

    return (
      <div style={prepareStyles(styles.root)} ref={this.handleRef}>
        <div style={prepareStyles(styles.left)}></div>
        <div style={prepareStyles(styles.center)}>
          <div
            style={prepareStyles(styles.innerItem)}
            onTouchTap={() => handleSelect(tab)}
          >
            <a
              href="#"
              style={prepareStyles(styles.label)}
              title={file.moduleName || file.name}
            >
            {tab.label}
            </a>
            <IconButton
              style={styles.rightButton}
              onTouchTap={handleRightTouchTap}
              onMouseEnter={handleRightMouseEnter}
              onMouseLeave={handleRightMouseLeave}
            >
              <NavigationClose color={
                closerMouseOver ? alternateTextColor : secondaryTextColor
              } />
            </IconButton>
          </div>
        </div>
        <div style={prepareStyles(styles.right)}></div>
      </div>
    );
  }
}
