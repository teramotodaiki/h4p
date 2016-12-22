import React, { Component, PropTypes } from 'react';
import LinearProgress from 'material-ui/LinearProgress';
import transitions from 'material-ui/styles/transitions';


import { SizerWidth } from '../Monitor/';


const PREWARM_TIME = 1000;
const getAnimateTime = (time) => (
  Math.max(1, time - PREWARM_TIME)
);

const getStyle = (props, context, state) => {
  const {
    palette,
  } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      position: 'relative',
      boxSizing: 'border-box',
      width: '100%',
      paddingLeft: SizerWidth,
      backgroundColor: palette.canvasColor,
      height: state.complete ? 14 : 6,
      borderBottom: `1px solid ${palette.borderColor}`,
      transition: transitions.easeOut(),
    },
    label: {
      color: palette.accent1Color,
      fontSize: '.5rem',
      opacity: state.complete ? 1 : 0,
      verticalAlign: 'top',
      transition: transitions.easeOut(),
    },
    bar: {
      position: 'absolute',
      left: 0,
      top: 0,
      paddingLeft: SizerWidth,
      width: '100%',
      height: '100%',
    },
    barColor: {
      width: state.animate ? 0 : '100%',
      height: '100%',
      backgroundColor: palette.accent1Color,
      opacity: 0.5,
      transition: transitions.easeOut(
        `${getAnimateTime(props.time)}ms`, null, null, 'linear'
      ),
    },
  };
};

export default class SaveProgress extends Component {

  static propTypes = {
    time: PropTypes.number.isRequired,
    startRef: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    complete: true,
    animate: false,
  };

  actions = {
    prewarm:  () => this.setState({ complete: false, animate: false }),
    animate:  () => this.setState({ complete: false, animate: true }),
    complete: () => this.setState({ complete: true, animate: false }),
  };
  _prewarm = null; // timer ID
  _animate = null; // timer ID

  componentDidMount() {
    this.props.startRef(this.handleStart);
  }

  componentDidUpdate() {
    if (this.state.animate) {
      this._animate = setTimeout(() => {
        this.actions.complete();
      }, getAnimateTime(this.props.time));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.complete !== nextState.complete ||
      this.state.animate !== nextState.animate
    );
  }

  handleStart = () => {
    clearTimeout(this._prewarm);
    clearTimeout(this._animate);

    if (!this.state.prewarm) {
      this.actions.prewarm();
    }
    this._prewarm = setTimeout(() => {
      this.actions.animate();
    }, PREWARM_TIME);
  };

  render() {
    const {
      root,
      label,
      bar,
      barColor,
    } = getStyle(this.props, this.context, this.state);

    return (
      <div style={root}>
        <span style={label}>SAVED</span>
        {this.state.complete ? null : (
          <div style={bar}><div style={barColor} /></div>
        )}
      </div>
    );
  }
}
