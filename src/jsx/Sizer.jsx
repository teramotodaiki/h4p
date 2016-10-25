import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import { transparent } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import classNames from 'classnames';


const isTouchEnabled = 'ontouchend' in document;
const MOVE_EVENT = isTouchEnabled ? 'touchmove' : 'mousemove';
const END_EVENT = isTouchEnabled ? 'touchend' : 'mouseup';

const getStyles = (props, context) => {

  const {
    primaryWidth,
    secondaryHeight,
  } = props;
  const { palette } = context.muiTheme;

  const sizerWidth = 24;

  return {
    root: {
      position: 'absolute',
      boxSizing: 'border-box',
      height: '100%',
      width: sizerWidth,
      paddingBottom: secondaryHeight,
      backgroundColor: palette.canvasColor,
      cursor: 'col-resize',
      zIndex: 100,
      transition: transitions.easeOut(null, 'box-shadow'),
    },
    blade: {
      marginTop: 0,
      borderTopWidth: 0,
      borderRightWidth: 0,
      borderBottomWidth: 40,
      borderLeftWidth: sizerWidth,
      borderStyle: 'solid',
      borderColor: transparent,
      height: '100%',
      borderLeftColor: palette.primary1Color,
    }
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
    const { secondaryHeight } = this.props;
    const { hover } = this.state;
    const { prepareStyles } = this.context.muiTheme;

    const { root, blade } = getStyles(this.props, this.context);

    const events = isTouchEnabled ? {
      onTouchStart: this.handleMouseDown
    } : {
      onMouseDown: this.handleMouseDown,
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave
    };

    return (
      <Paper rounded={false} zDepth={hover ? 2 : 0} style={root} {...events}>
        <div style={prepareStyles(blade)}></div>
      </Paper>
    );
  }
}
