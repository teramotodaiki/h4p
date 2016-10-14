import React, { Component, PropTypes } from 'react';
import { faintBlack, transparent } from 'material-ui/styles/colors';
import classNames from 'classnames';


const isTouchEnabled = 'ontouchend' in document;
const MOVE_EVENT = isTouchEnabled ? 'touchmove' : 'mousemove';
const END_EVENT = isTouchEnabled ? 'touchend' : 'mouseup';

export default class Sizer extends Component {

  static propTypes = {
    handleResize: PropTypes.func.isRequired,
    primaryWidth: PropTypes.number.isRequired,
    secondaryHeight: PropTypes.number.isRequired
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

    const primaryWidth = Math.min(window.innerWidth, Math.max(0,
      this.props.primaryWidth - movementX
    ));
    const secondaryHeight = Math.min(window.innerHeight, Math.max(0,
      this.props.secondaryHeight - movementY
    ));

    this.props.handleResize(primaryWidth, secondaryHeight);

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
    const { secondaryHeight } = this.props;

    const className = classNames(CSS_PREFIX + 'sizer', {
      [`${CSS_PREFIX}sizer-active`]: this.state.isActive
    });

    const style = Object.assign({}, this.props.style, {
      paddingBottom: secondaryHeight,
    });

    const bladeStyle = {
    };

    const events = isTouchEnabled ? {
      onTouchStart: this.handleMouseDown
    } : {
      onMouseDown: this.handleMouseDown
    };

    return (
      <div
        className={className}
        style={style}
        {...events}
      >
        <div style={bladeStyle}></div>
      </div>
    );
  }
}
