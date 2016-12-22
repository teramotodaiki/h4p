import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AvPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import AvStop from 'material-ui/svg-icons/av/stop';
import transitions from 'material-ui/styles/transitions';


import Editor from './Editor';

const durations = [600, 1400, 0];

const getStyles = (props, context, state) => {
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;
  const { anim, height } = state;

  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
      margin: '1rem 1rem 1rem 0',
    },
    editor: {
      boxSizing: 'border-box',
      width: '100%',
      height: Math.min(500, height + spacing.desktopGutterMore),
      marginLeft: anim === 1 ? -400 : 0,
      transform: `
        rotateZ(${anim === 1 ? -180 : 0}deg)
        scaleY(${anim === 2 ? 0 : 1})`,
      opacity: anim === 0 ? 1 : 0.1,
      transition: transitions.easeOut(durations[anim] + 'ms'),
    },
    menu: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 36,
    },
    shoot: {
      marginLeft: 9,
      marginBottom: 4,
      transform: `
        rotateY(${anim === 0 ? 180 : 0}deg)`,
    },
    label: {
      color: palette.secondaryTextColor,
      fontSize: '.8rem',
    },
  };
};

export default class ShotFrame extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    canRestore: PropTypes.bool.isRequired,
    onShot: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onRestore: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    completes: PropTypes.array.isRequired,
    getConfig: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    anim: 0,
    height: 0,
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

  _oldRef = null;
  handleCodemirror = (ref) => {
    if (this._oldRef) {
      this._oldRef.off('change', this.handleChange);
    }
    ref.on('change', this.handleChange);
    this.handleChange(ref);
    this._oldRef = ref;
  };

  handleChange = (cm) => {
    const lastLine = cm.lastLine() + 1;
    const height = cm.heightAtLine(lastLine, 'local');
    this.setState({ height });
  };

  render() {
    const {
      file,
      canRestore,
      updateShot,
      onRestore,
      localization,
      completes,
      getConfig,
    } = this.props;
    const { anim } = this.state;

    const {
      root,
      editor,
      menu,
      shoot,
      label,
    } = getStyles(this.props, this.context, this.state);

    return (
      <Paper style={root}>
        <div style={editor}>
          <Editor isSelected isCared
            file={file}
            onChange={this.handleChange}
            getConfig={getConfig}
            codemirrorRef={(ref) => (this.codemirror = ref)}
            completes={completes}
          />
        </div>
        <div style={menu}>
          <div>
            <FloatingActionButton mini
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
            <span style={label}>{localization.shot.shoot}</span>
          </div>
          <FlatButton secondary
            label={localization.shot.restore}
            onTouchTap={onRestore}
            disabled={!canRestore}
          />
        </div>
      </Paper>
    );
  }
}
