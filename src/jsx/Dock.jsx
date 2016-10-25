import React, { Component, PropTypes } from 'react';


const getStyle = (props, context) => {
  const { config } = props;
  const { palette } = context.muiTheme;

  return {
    root: {
      position: 'absolute',
      left: config.width,
      top: config.height,
      width: 0,
      height: 0,
    },
    pane: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      right: 0,
      bottom: 0,
      width: config.width,
      height: config.height,
      backgroundColor: palette.backgroundColor,
    }
  };
};

export default class Dock extends Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    style: PropTypes.object.isRequired,
    children: PropTypes.node
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const { style, children } = this.props;
    const { prepareStyles } = this.context.muiTheme;

    const { root, pane } = getStyle(this.props, this.context);

    const paneStyle = prepareStyles(
      Object.assign({}, pane, style)
    );

    return (
      <div style={prepareStyles(root)}>
        <div style={paneStyle}>
        {children}
        </div>
      </div>
    );
  }
}
