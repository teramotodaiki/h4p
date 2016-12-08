import React, { Component, PropTypes } from 'react';


import SnippetButton from './SnippetButton';
import { SizerWidth } from '../Monitor/';


const getStyle = (props, context) => {
  const {
    palette,
  } = context.muiTheme;

  const commonMenu = {
    fontSize: '.8rem',
    borderRadius: 2,
    padding: '0 4px',
    margin: '2px 4px',
    cursor: 'pointer',
  };

  return {
    root: {
      flex: '0 0 auto',
      backgroundColor: palette.canvasColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    menu: {
      display: 'flex',
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
    enabled: Object.assign({
      color: palette.alternateTextColor,
      backgroundColor: palette.secondaryTextColor,
    }, commonMenu),
    disabled: commonMenu,
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

  componentWillReceiveProps(nextProps) {
    if (this.props.snippets !== nextProps.snippets) {
      const show = this.getShowState((key) => this.state.show[key]);
      this.setState({ show });
    }
  }

  handleToggle = (key) => {
    const show = Object.keys(this.state.show)
      .map((item) => ({
        [key]: !!(item === key ^ this.state.show[item])
      }))
      .reduce((p, c) => Object.assign(p, c), {});

    this.setState({ show });
  };

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
      enabled,
      disabled,
    } = getStyle(this.props, this.context);

    const menus = Object.keys(show).map((key) => {
      const style = show[key] ? enabled : disabled;
      return (
        <span
          key={key}
          style={style}
          onTouchTap={() => this.handleToggle(key)}
        >{key}</span>
      );
    });

    return (
      <div style={root}>
        <div style={menu}>{menus}</div>
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
