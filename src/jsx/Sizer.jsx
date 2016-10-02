import React, { Component, PropTypes } from 'react';
import { faintBlack, transparent } from 'material-ui/styles/colors';
import classNames from 'classnames';

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
  };

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  render() {
    const { secondaryHeight } = this.props;

    const className = classNames(CSS_PREFIX + 'sizer', {
      [`${CSS_PREFIX}sizer-active`]: this.state.isActive
    });

    const bladeStyle = {
      height: secondaryHeight,
      borderRightColor: faintBlack,
    };

    return (
      <div
        className={className}
        style={this.props.style}
        onMouseDown={this.handleMouseDown}
      >
        <div style={bladeStyle}></div>
      </div>
    );
  }
}
