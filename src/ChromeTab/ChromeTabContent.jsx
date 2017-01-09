import React, { PureComponent, PropTypes } from 'react';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';


const getStyles = (props, context) => {
  const { show } = props;
  const {
    palette,
  } = context.muiTheme;

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
      borderTop: `1px solid ${palette.primary1Color}`,
    },
  }
};

export default class ChromeTabContent extends PureComponent {

  static propTypes = {
    show: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  shouldComponentUpdate(nextProps) {
    if (!this.props.show && !nextProps.show) {
      return false;
    }
    return true;
  }

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
