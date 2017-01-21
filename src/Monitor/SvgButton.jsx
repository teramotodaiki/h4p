import React, { PureComponent, PropTypes } from 'react';
import { fullWhite, transparent } from 'material-ui/styles/colors';

export default class SvgButton extends PureComponent {

  static propTypes = {
    onTouchTap: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
  };

  static defaultProps = {
    style: {},
  };

  render() {
    const svgStyle = {
      width: 24,
      height: 24,
    };

    const style = {
      backgroundColor: transparent,
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      ...this.props.style,
    };

    return (
      <button
        style={style}
        onTouchTap={this.props.onTouchTap}
      >
        <svg
          fill={fullWhite}
          style={svgStyle}
          viewBox="0 0 24 24"
        >
          <path d={this.props.children}/>
        </svg>
      </button>
    );
  }
}
