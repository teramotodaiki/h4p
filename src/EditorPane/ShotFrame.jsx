import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import LinearProgress from 'material-ui/LinearProgress';
import AvPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import AvStop from 'material-ui/svg-icons/av/stop';
import transitions from 'material-ui/styles/transitions';
import { red50, red500 } from 'material-ui/styles/colors';


import SaveProgress from './SaveProgress';
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
    error: {
      flex: '0 1 auto',
      margin: 0,
      padding: 8,
      backgroundColor: red50,
      color: red500,
      fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
      overflow: 'scroll',
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
    error: null,
    loading: false,
  };

  componentDidMount() {
    this.handleResize();
  }

  shoot = () => {
    if (this.state.anim !== 0) {
      return;
    }

    const transition = (anim, delay) => {
      return new Promise((resolve, reject) => {
        this.setState({ anim }, () => {
          setTimeout(() => resolve(), durations[anim] + 10);
        });
      });
    };

    Promise.resolve()
    .then(() => this.handleShot())
    .then(() => transition(1))
    .then(() => transition(2))
    .then(() => transition(0));

  };

  handleResize = () => {
    if (!this.codemirror) {
      return;
    }
    const lastLine = this.codemirror.lastLine() + 1;
    const height = this.codemirror.heightAtLine(lastLine, 'local');
    if (this.state.height !== height) {
      this.setState({ height });
    }
  };

  handleChange = (text) => {
    this.handleResize();
  };

  handleRestore = () => {
    this.props.onRestore()
      .then((file) => {
        if (this.codemirror) {
          this.codemirror.setValue(file.text);
          this.handleResize();
        }
      });
  };

  handleShot = () => {
    const text = this.codemirror ?
      this.codemirror.getValue('\n') :
      this.props.file.text;

    const waitForRender = new Promise((resolve, reject) => {
      this.setState({
        error: null,
        loading: true,
      }, resolve);
    });

    waitForRender
      .then(() => this.props.onShot(text))
      .then(() => this.setState({
        loading: false,
      }))
      .catch((error) => this.setState({
        error,
        loading: false,
      }));

    return waitForRender;
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
      error,
    } = getStyles(this.props, this.context, this.state);

    return (
      <Paper style={root}>
        {this.state.error ? (
          <pre style={error}>{this.state.error.message}</pre>
        ) : null}
        {this.state.loading ? (
          <LinearProgress />
        ) : null}
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
            onTouchTap={this.handleRestore}
            disabled={!canRestore}
          />
        </div>
      </Paper>
    );
  }
}
