import React, { Component, PropTypes } from 'react';
import { fade } from 'material-ui/utils/colorManipulator';


const getStyles = (props, context) => {
  const { show } = props;
  const {
    canvasColor,
    borderColor,
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
      display: 'flex',
      flexDirection: 'column',
    },
    bar: {
      flex: '0 0 auto',
      boxSizing: 'border-box',
      height: 6,
      borderTopWidth: 1,
      borderRightWidth: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 1,
      borderStyle: 'solid',
      borderColor: borderColor,
      backgroundColor: fade(canvasColor, 1),
    },
    container: {
      flex: '1 1 auto',
    }
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

    const { root, bar, container } = getStyles(this.props, this.context);

    return (
      <div style={prepareStyles(root)}>
        <div style={prepareStyles(bar)}></div>
        <div style={prepareStyles(container)}>
        {children}
        </div>
      </div>
    );
  }
}
