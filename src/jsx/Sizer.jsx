import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class Sizer extends Component {

  static Width = 14;

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

    const primaryWidth = this.props.primaryWidth - movementX;
    const secondaryHeight = this.props.secondaryHeight - movementY;

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

    const className = classNames(CSS_PREFIX + 'frame_resizer', {
      [`${CSS_PREFIX}frame_resizer-active`]: this.state.isActive
    });

    const style = Object.assign({
      backgroundColor: 'rgb(255,255,255)',
    }, this.props.style);

    return (
      <div
        className={className}
        style={style}
        onMouseDown={this.handleMouseDown}
      />
    );
  }
}
