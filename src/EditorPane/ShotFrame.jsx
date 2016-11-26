import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AvPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import AvStop from 'material-ui/svg-icons/av/stop';
import ActionRestore from 'material-ui/svg-icons/action/restore';
import transitions from 'material-ui/styles/transitions';


const durations = [600, 1400, 0];

const getStyles = (props, context, state) => {
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;
  const { anim } = state;

  return {
    root: prepareStyles({
      position: 'relative',
      width: '100%',
      height: 300,
      margin: '1rem 0',
    }),
    editor: {
      position: 'absolute',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      right: anim === 1 ? '100%' : 0,
      transform: `
        rotateZ(${anim === 1 ? -180 : 0}deg)
        scaleY(${anim === 2 ? 0 : 1})`,
      opacity: anim === 0 ? 1 : 0.1,
      transition: transitions.easeOut(durations[anim] + 'ms'),
    },
    shoot: {
      position: 'absolute',
      bottom: 4,
      left: 2,
      transform: `
        rotateY(${anim === 0 ? 180 : 0}deg)`,
    },
    restore: {
      position: 'absolute',
      bottom: 4,
      right: 2,
    },
  };
};

export default class ShotFrame extends Component {

  static propTypes = {
    canRestore: PropTypes.bool.isRequired,
    onShot: PropTypes.func.isRequired,
    onRestore: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    anim: 0,
  };

  shoot = () => {
    if (this.state.anim !== 0) {
      return;
    }
    const { onShot } = this.props;

    const transition = (anim, delay) => {
      return new Promise((resolve, reject) => {
        this.setState({ anim }, () => {
          setTimeout(() => resolve(), durations[anim] + 10);
        });
      });
    };

    Promise.resolve()
    .then(() => transition(1))
    .then(() => onShot())
    .then(() => transition(2))
    .then(() => transition(0))
    .then(() => this.forceUpdate());

  };

  render() {
    const {
      canRestore,
      updateShot,
      children,
      onRestore,
    } = this.props;
    const { anim } = this.state;

    const {
      root,
      label,
      editor,
      shoot,
      restore,
    } = getStyles(this.props, this.context, this.state);

    return (
      <div style={root}>
        <Paper style={editor}>
        {children}
        </Paper>
        <FloatingActionButton secondary
          disabled={anim !== 0}
          onTouchTap={this.shoot}
          style={shoot}
        >
        {anim === 0 ? (
          <AvPlayArrow />
        ) : (
          <AvStop />
        )}
        </FloatingActionButton>
        <FloatingActionButton mini
          disabled={!canRestore}
          onTouchTap={onRestore}
          style={restore}
          zDepth={1}
        >
          <ActionRestore />
        </FloatingActionButton>
      </div>
    );
  }
}
