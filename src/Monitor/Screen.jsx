import React, { PropTypes, Component } from 'react';
import { white, transparent } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';


export const SrcDocEnabled = !!('srcdoc' in document.createElement('iframe'));

export default class Screen extends Component {

  static propTypes = {
    animation: PropTypes.bool.isRequired,
    display: PropTypes.bool.isRequired,
    frameRef: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
    error: PropTypes.object,
  };

  static defaultProps = {
    animation: false,
    display: false,
    error: null,
  };

  state = {
    loading: false,
  };

  handleTap = () => {
    if (!this.props.animation) {
      this.props.handleRun();
      return;
    }
    if (this.state.loading) {
      return;
    }
    this.setState({ loading: true }, () => {
      this.props.handleRun();
      setTimeout(() => {
        this.setState({ loading: false });
      }, 250);
    });
  };

  render() {
    const {
      display,
      frameRef,
      error,
    } = this.props;

    const {
      loading,
    } = this.state;

    const style = {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(gray, black)',
      display: display ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    };

    const frameStyle = {
      border: '0 none',
      flex: '0 0 auto',
      opacity: loading ? 0 : 1,
      transition: loading ?
        'none' :
        transitions.easeOut(null, 'opacity'),
    };

    const buttonStyle = {
      position: 'absolute',
      left: 0,
      top: 0,
      backgroundColor: transparent,
      border: 'none',
      outline: 'none',
      zIndex: 1,
      cursor: 'pointer',
    };

    const svgStyle = {
      width: 24,
      height: 24,
    };

    const errorStyle = {
      position: 'absolute',
      width: '100%',
      top: 0,
      paddingTop: '1.5rem',
      backgroundColor: 'red',
      color: 'white',
    };

    const sandbox = SrcDocEnabled ?
      "allow-scripts allow-modals allow-popups" :
      "allow-scripts allow-modals allow-popups allow-same-origin";

    return (
      <div style={style}>
        <button
          style={buttonStyle}
          onTouchTap={this.handleTap}
        >
          <svg
            fill={white}
            style={svgStyle}
            viewBox="0 0 24 24"
          >
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
        <iframe
          sandbox={sandbox}
          style={frameStyle}
          ref={frameRef}
        ></iframe>
        {error ? (
          <div style={errorStyle}>{error.message}</div>
        ) : null}
      </div>
    );
  }
}
