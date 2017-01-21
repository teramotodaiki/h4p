import React, { PureComponent, PropTypes } from 'react';
import { fullWhite, red500 } from 'material-ui/styles/colors';


import SvgButton from './SvgButton';

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
        <SvgButton style={styles.button} onTouchTap={this.handleClose}>
          {"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"}
        </SvgButton>
        <pre style={styles.pre}>{this.message}</pre>
      </div>
    ) : null;
  }
}
