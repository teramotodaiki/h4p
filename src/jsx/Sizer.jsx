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

  const { secondaryHeight } = props;
  const { palette } = context.muiTheme;

  const blade = SizerWidth * Math.tan(SkewY / 180 * Math.PI);

  return {
    root: {
      position: 'absolute',
      boxSizing: 'border-box',
      height: '100%',
      width: SizerWidth,
      bottom: secondaryHeight - MenuHeight + blade / 2,

      cursor: 'col-resize',
      backgroundColor: palette.primary1Color,
      transform: `skewY(${-SkewY}deg)`,
      zIndex: 100,
      transition: transitions.easeOut(null, 'box-shadow'),
    },
  };

};

export default class Sizer extends Component {

  static propTypes = {
    handleResize: PropTypes.func.isRequired,
    primaryWidth: PropTypes.number.isRequired,
    secondaryHeight: PropTypes.number.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    isActive: false,
    hover: false,
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

    const primaryWidth = Math.min(window.innerWidth, Math.max(0,
      this.props.primaryWidth - movementX
    ));
    const secondaryHeight = Math.min(window.innerHeight, Math.max(0,
      this.props.secondaryHeight - movementY
    ));

    this.props.handleResize(primaryWidth, secondaryHeight);

    getSelection().removeAllRanges();
  };

  handleMouseEnter = () => {
    this.setState({ hover: true });
  };

  handleMouseLeave = () => {
    this.setState({ hover: false });
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
    const { hover } = this.state;

    const { root } = getStyles(this.props, this.context);

    const events = isTouchEnabled ? {
      onTouchStart: this.handleMouseDown
    } : {
      onMouseDown: this.handleMouseDown,
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave
    };

    return (
      <Paper
        rounded={false}
        zDepth={hover ? 2 : 0}
        style={root}
        {...events}
      />
    );
  }
}
