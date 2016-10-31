import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AvPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import { transparent } from 'material-ui/styles/colors';
import ReactCodeMirror from 'react-codemirror';


const getStyles = (props, context) => {
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;

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
    }),
    buttonContainer: prepareStyles({
      position: 'absolute',
      width: '100%',
      height: spacing.desktopGutter,
      bottom: 0,
      textAlign: 'center',
      background: `linear-gradient(${transparent}, ${palette.accent1Color})`
    }),
    button: {
      marginTop: -100,
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

  shot = () => {
    const { onShot, shot } = this.props;
    onShot(shot.text);
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
    } = getStyles(this.props, this.context);

    return (
      <div style={root}>
        <Paper style={container}>
          <div style={editor}>
            <ReactCodeMirror
              value={shot.text}
              onChange={(text) => updateShot({ text })}
              options={options}
            />
            <div style={buttonContainer}>
              <FloatingActionButton secondary
                onTouchTap={this.shot}
                style={button}
              >
                <AvPlayArrow />
              </FloatingActionButton>
            </div>
          </div>
        </Paper>
      </div>
    );
  }
}
