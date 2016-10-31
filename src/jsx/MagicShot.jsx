import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AvPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import { transparent } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';
import ReactCodeMirror from 'react-codemirror';


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
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      boxSizing: 'border-box',
      padding: 0,
      paddingRight: spacing.desktopGutterMini,
      paddingLeft: spacing.desktopGutterMini,
      zIndex: 2000,
    }),
    container: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 0,
      paddingTop: spacing.desktopGutterMore,
      paddingRight: 1,
      paddingBottom: spacing.desktopGutterMini,
      paddingLeft: 1,
      backgroundColor: palette.accent1Color,
    },
    editor: prepareStyles({
      flex: '1 1 auto',
      position: 'relative',
      boxSizing: 'border-box',
      width: '100%',
      marginRight: anim === 1 ? '240%' : 0,
      transform: `
        rotateZ(${anim === 1 ? -180 : 0}deg)
        scaleY(${anim === 2 ? 0 : 1})`,
      opacity: anim === 0 ? 1 : 0.1,
      transition: transitions.easeOut(durations[anim] + 'ms'),
    }),
    buttonContainer: prepareStyles({
      width: '100%',
      height: spacing.desktopGutter,
      marginTop: -spacing.desktopGutter,
      textAlign: 'center',
      background: `linear-gradient(
        ${fade(palette.accent1Color, 0)},
        ${palette.accent1Color})`,
      zIndex: 1,
    }),
    button: {
      marginTop: anim === 0 ? -30 : 60,
    },
  };
};

export default class MagicShot extends Component {

  static propTypes = {
    shot: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    onShot: PropTypes.func.isRequired,
    updateShot: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    anim: 0,
  };

  shoot = () => {
    if (this.state.shooting) {
      return;
    }
    const { onShot, shot } = this.props;

    const transition = (anim, delay) => {
      return new Promise((resolve, reject) => {
        this.setState({ anim }, () => {
          setTimeout(() => resolve(), durations[anim]);
        });
      });
    };

    Promise.resolve()
    .then(() => transition(1))
    .then(() => transition(2))
    .then(() => transition(0))
    .then(() => this.forceUpdate());

    onShot(shot.text)
  };

  render() {
    const {
      shot,
      options,
      updateShot,
    } = this.props;

    const {
      root,
      container,
      label,
      editor,
      buttonContainer,
      button,
    } = getStyles(this.props, this.context, this.state);

    return (
      <div style={root}>
        <Paper style={container}>
          <div style={editor}>
            <ReactCodeMirror
              value={shot.text}
              onChange={(text) => updateShot({ text })}
              options={options}
            />
          </div>
          <div style={buttonContainer}>
            <FloatingActionButton secondary
              onTouchTap={this.shoot}
              style={button}
            >
              <AvPlayArrow />
            </FloatingActionButton>
          </div>
        </Paper>
      </div>
    );
  }
}
