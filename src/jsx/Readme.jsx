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
      paddingLeft: spacing.desktopGutterMini,
      paddingRight: spacing.desktopGutterMini,
      paddingBottom: spacing.desktopGutterMore,
    }),
  };
};

const mdStyle = (props, state, context) => {
  const {
    palette,
  } = context.muiTheme;

  return {
    blockquote: {
      color: palette.secondaryTextColor,
      marginLeft: '1rem',
      paddingLeft: '1rem',
      borderLeft: `5px solid ${palette.disabledColor}`,
    },
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

  renderIterate(tag, props, children) {
    if (tag === 'a') {
      return <a {...props} target="_blank">{children}</a>;
    }
    if (tag === 'blockquote') {
      return <blockquote {...props}>{children}</blockquote>;
    }
    
    return null;

  };

  render() {
    const {
      readme,
      localization,
      onTouchTap,
    } = this.props;

    const {
      prepareStyles,
    } = this.context.muiTheme;

    const {
      root,
      container,
      header,
      markdown,
    } = getStyle(this.props, this.state, this.context);

    const {
      gettingStarted,
    } = localization.readme;

    const mdStyles = mdStyle(this.props, this.state, this.context);

    const onIterate = (tag, props, children) => {
      if (mdStyles[tag]) {
        const style = prepareStyles(
          Object.assign({}, props.style || {}, mdStyles[tag])
        );
        props = Object.assign({}, props, { style });
      }
      return this.renderIterate(tag, props, children);
    };

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
            onIterate={onIterate}
          />
        </Paper>
      </div>
    );
  }
}
