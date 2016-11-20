import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import transitions from 'material-ui/styles/transitions';


const isTouchEnabled = 'ontouchend' in document;
const MOVE_EVENT = isTouchEnabled ? 'touchmove' : 'mousemove';
const END_EVENT = isTouchEnabled ? 'touchend' : 'mouseup';

const SkewY = 66;
const SizerWidth = 24;
const MenuHeight = 40;

const getStyles = (props, context) => {

  const { width, height } = props;
  const {
    palette,
    spacing,
  } = context.muiTheme;

  const blade = SizerWidth * Math.tan(SkewY / 180 * Math.PI);
  const margin = 8;

  return {
    root: {
      position: 'absolute',
      top: 0,
      left: width,
      width: SizerWidth,
      height,
      paddingRight: spacing.desktopGutterMini,
      paddingBottom: spacing.desktopGutterMini,
      overflow: 'hidden',
      cursor: 'col-resize',
      zIndex: 2,
      transition: transitions.easeOut(null, 'box-shadow'),
    },
    color: {
      width: '100%',
      height: '100%',
      marginTop: -blade / 2,
      transform: `skewY(${-SkewY}deg)`,
      backgroundColor: palette.primary1Color,
    },
  };

};

export default class Sizer extends Component {

  static propTypes = {
    handleResize: PropTypes.func.isRequired,
    hover: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    isActive: false,
  };

  prevent = {};
  handleMouseDown = ({ nativeEvent }) => {
    const { clientX, clientY } = nativeEvent;
    this.prevent = { clientX, clientY };
    this.setState({ isActive: true });
  };

  handleMouseUp = () => {
    this.setState({ isActive: false });
  };

  handleMouseMove = (event) => {
    if (!this.state.isActive) return;
    const { clientX, clientY } = event;
    const movementX = clientX - this.prevent.clientX;
    const movementY = clientY - this.prevent.clientY;
    this.prevent = { clientX, clientY };

    const width = Math.min(window.innerWidth, Math.max(0,
      this.props.width + movementX
    ));
    const height = Math.min(window.innerHeight, Math.max(MenuHeight,
      this.props.height + movementY
    ));

    this.props.handleResize(width, height);

    getSelection().removeAllRanges();
  };

  componentDidMount() {
    window.addEventListener(MOVE_EVENT, this.handleMouseMove);
    window.addEventListener(END_EVENT, this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener(MOVE_EVENT, this.handleMouseMove);
    window.removeEventListener(END_EVENT, this.handleMouseUp);
  }

  render() {
    const {
      hover,
      onMouseEnter,
      onMouseLeave,
    } = this.props;

    const { root, color } = getStyles(this.props, this.context);

    const events = isTouchEnabled ? {
      onTouchStart: this.handleMouseDown
    } : {
      onMouseDown: this.handleMouseDown,
      onMouseEnter,
      onMouseLeave,
    };

    return (
      <div style={root}>
        <Paper
          rounded={false}
          zDepth={hover ? 2 : 1}
          style={color}
          {...events}
        />
      </div>

    );
  }
}
