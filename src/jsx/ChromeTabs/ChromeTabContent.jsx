import React, { Component, PropTypes } from 'react';


const getStyles = (props, context) => {
  const { show } = props;
  const {
    canvasColor,
  } = context.muiTheme.palette;

  const sizerWidth = 24;

  return {
    root: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      visibility: show ? 'visible' : 'hidden',
      backgroundColor: 'transparent',
      zIndex: show ? 2 : 1,
    },
  }
};

export default class ChromeTabContent extends Component {

  static propTypes = {
    show: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const { children } = this.props;
    const { prepareStyles } = this.context.muiTheme;

    const { root } = getStyles(this.props, this.context);

    return (
      <div style={prepareStyles(root)}>
      {children}
      </div>
    );
  }
}
