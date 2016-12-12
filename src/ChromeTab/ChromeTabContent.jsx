import React, { Component, PropTypes } from 'react';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';


const getStyles = (props, context) => {
  const { show } = props;
  const {
    palette,
  } = context.muiTheme;

  const sizerWidth = 24;

  return {
    root: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: show ? 1 : 0,
      backgroundColor: 'transparent',
      zIndex: show ? 11 : 10,
      display: 'flex',
      flexDirection: 'column',
    },
    container: {
      flex: '1 1 auto',
      borderTop: `1px solid ${palette.borderColor}`,
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

    const { root, container } = getStyles(this.props, this.context);

    return (
      <div style={prepareStyles(root)}>
        <div style={prepareStyles(container)}>
        {children}
        </div>
      </div>
    );
  }
}
