import React, { Component, PropTypes } from 'react';


import SnippetButton from './SnippetButton';
import { SizerWidth } from '../Monitor/';


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
    container: {
      borderTop: `1px solid ${palette.borderColor}`,
      height: 240,
      paddingBottom: 60,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'between',
      overflow: 'scroll',
      boxSizing: 'border-box',
      paddingLeft: SizerWidth,

    },
  }
};

export default class SnippetPane extends Component {

  static propTypes = {
    snippets: PropTypes.array.isRequired,
  };

  static defaultProps = {
    snippets: [],
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const {
      snippets,
    } = this.props;

    const {
      root,
      menu,
      container,
    } = getStyle(this.props, this.context);

    return (
      <div style={root}>
        <div style={menu}></div>
        <div style={container}>
        {snippets.map((snippet) => (
          <SnippetButton
            key={snippet.key}
            snippet={snippet}
          />
        ))}
        </div>
      </div>
    );
  }
}
