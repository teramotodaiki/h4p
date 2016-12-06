import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';


const getStyle = (props, context) => {
  const {
    spacing,
  } = context.muiTheme;

  return {
    root: {
      margin: spacing.desktopGutterMini,
    },
    button: {
      boxSizing: 'border-box',
      width: '5.5rem',
      height: '5.5rem',
      padding: spacing.desktopGutterMini,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    prefix: {
      fontSize: '1rem',
    },
    leftLabel: {
      fontSize: '0.5rem',
    },
  };
};

export default class SnippetButton extends Component {

  static propTypes = {
    snippet: PropTypes.object.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const {
      snippet,
    } = this.props;

    const {
      root,
      button,
      prefix,
      leftLabel,
    } = getStyle(this.props, this.context);

    return (
      <div style={root}>
        <Paper style={button}>
          <span style={prefix}>{snippet.prefix}</span>
          <span style={leftLabel}>{snippet.leftLabel}</span>
        </Paper>
      </div>
    );
  }
}
