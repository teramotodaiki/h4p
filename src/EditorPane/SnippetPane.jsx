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
      overflow: 'scroll',
      boxSizing: 'border-box',
      paddingLeft: SizerWidth,
      justifyContent: 'flex-start',
    },
  }
};

export default class SnippetPane extends Component {

  static propTypes = {
    snippets: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
  };

  static defaultProps = {
    snippets: [],
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    show: this.getShowState((key, i) => i === 0),
  };

  getShowState(predicate) {
    return this.props.snippets
      .map((snippet) => snippet.plane)
      .filter((key, i, array) => array.indexOf(key) === i)
      .map((key, i) => ({ [key]: !!predicate(key, i) }))
      .reduce((p, c) => Object.assign(p, c), Object.create(null));
  }

  render() {
    const {
      snippets,
      findFile,
    } = this.props;
    const {
      show,
    } = this.state;
    const {
      root,
      menu,
      container,
    } = getStyle(this.props, this.context);

    return (
      <div style={root}>
        <div style={menu}></div>
        <div style={container}>
        {snippets
          .filter((snippet) => show[snippet.plane])
          .map((snippet) => (
            <SnippetButton
              key={snippet.key}
              snippet={snippet}
              findFile={findFile}
            />
          )
        )}
        </div>
      </div>
    );
  }
}
