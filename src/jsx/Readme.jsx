import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import CommunicationImportContacts from 'material-ui/svg-icons/communication/import-contacts';


import MDReactComponent from '../../lib/MDReactComponent';

const getStyle = (props, state, context) => {
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
      boxSizing: 'border-box',
      padding: 0,
      paddingRight: spacing.desktopGutterMini,
      paddingLeft: spacing.desktopGutterMore,
      zIndex: 2000,

    }),
    container: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      borderWidth: 1,
      borderBottomWidth: 0,
      borderStyle: 'solid',
      borderColor: palette.accent1Color,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    header: {
      flex: '0 0 auto',
      color: palette.alternateTextColor,
      backgroundColor: palette.accent1Color,
      borderRadius: 0,
    },
    markdown: prepareStyles({
      flex: '1 1 auto',
      display: 'block',
      overflow: 'scroll',
    }),
  };
};

export default class Readme extends Component {

  static propTypes = {
    readme: PropTypes.string.isRequired,
    localization: PropTypes.object.isRequired,
    onTouchTap: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {

  };

  render() {
    const {
      readme,
      localization,
      onTouchTap,
    } = this.props;

    const {
      root,
      container,
      header,
      markdown,
    } = getStyle(this.props, this.state, this.context);

    const {
      gettingStarted,
    } = localization.readme;

    return (
      <div style={root}>
        <Paper style={container}>
          <FlatButton
            label={gettingStarted}
            icon={<CommunicationImportContacts />}
            style={header}
            onTouchTap={onTouchTap}
          />
          <MDReactComponent
            text={readme}
            style={markdown}
          />
        </Paper>
      </div>
    );
  }
}
