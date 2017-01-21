import React, { PureComponent, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { fullWhite, red500 } from 'material-ui/styles/colors';


export default class ErrorMessage extends PureComponent {

  static propTypes = {
    error: PropTypes.object,
  };

  static defaultProps = {
    error: null,
  };

  state = {
    open: false,
  };

  get message() {
    return this.props.error ? this.props.error.message : '';
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.error !== nextProps.error) {
      this.setState({
        open: nextProps.error !== null,
      });
    }
  }

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const styles = {
      root: {
        position: 'absolute',
        width: '100%',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: red500,
        zIndex: 3000,
      },
      button: {
        alignSelf: 'flex-end',
      },
      pre: {
        width: '100%',
        maxHeight: '8rem',
        color: fullWhite,
        overflow: 'scroll',
        fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
      },
    };

    return this.state.open ? (
      <div style={styles.root}>
        <FlatButton
          label=""
          style={styles.button}
          icon={<NavigationClose color={fullWhite} />}
          onTouchTap={this.handleClose}
        />
        <pre style={styles.pre}>{this.message}</pre>
      </div>
    ) : null;
  }
}
