import React, { Component, PropTypes } from 'react';


const getStyle = (props, context) => {
  const {
    palette,
  } = context.muiTheme;

  return {
    root: {
      flex: '0 0 auto',
      backgroundColor: palette.canvasColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    menu: {
      height: 12,
      borderTop: `1px solid ${palette.borderColor}`,
    },
    snippets: {
      borderTop: `1px solid ${palette.borderColor}`,
      height: 140,
      paddingBottom: 40,
    },
  }
};

export default class SnippetPane extends Component {

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const {
      root,
      menu,
      snippets,
    } = getStyle(this.props, this.context);

    return (
      <div style={root}>
        <div style={menu}></div>
        <div style={snippets}></div>
      </div>
    );
  }
}
