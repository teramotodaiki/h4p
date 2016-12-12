import React, { Component, PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';
import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert';


import SnippetButton from './SnippetButton';
import { SizerWidth } from '../Monitor/';
import { configs } from '../File/';


const getStyle = (props, context) => {
  const {
    snippets,
  } = props;
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
      paddingLeft: SizerWidth,
    },
    container: {
      borderTop: `1px solid ${palette.borderColor}`,
      height: snippets.length ? 240 : 0,
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
    swap: {
      position: 'absolute',
      right: 4,
      padding: 4,
      width: 24,
      height: 24,
    },
    swapIcon: {
      width: 16,
      height: 16,
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
    snippetFiles: this.findSnippetFiles(),
    fileKey: '',
  };

  componentDidMount() {
    const first = this.state.snippetFiles[0];
    if (first) {
      this.setState({ fileKey: first.key });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.snippets !== nextProps.snippets) {
      const snippetFiles = this.findSnippetFiles();
      this.setState({ snippetFiles });
    }
  }

  findSnippetFiles() {
    const {test} = configs.get('snippets');
    return this.props.findFile((file) => (
      !file.options.isTrashed && test.test(file.name)
    ), true);
  }

  render() {
    const {
      snippets,
      findFile,
    } = this.props;
    const {
      fileKey,
      snippetFiles,
    } = this.state;
    const {
      root,
      menu,
      container,
      enabled,
      disabled,
      swap, swapIcon,
    } = getStyle(this.props, this.context);

    const menus = snippetFiles.map((file) => {
      const style = file.key === fileKey ? enabled : disabled;
      return (
        <span
          key={file.key}
          style={style}
          onTouchTap={() => this.setState({ fileKey: file.key })}
        >{file.plane}</span>
      );
    });

    return (
      <div style={root}>
        <div style={menu}>{[...menus, (
          <IconButton
            key="ActionSwapVert"
            style={swap}
            iconStyle={swapIcon}
          >
            <ActionSwapVert />
          </IconButton>
        )]}</div>
        <div style={container}>
        {snippets
          .filter((snippet) => snippet.fileKey === fileKey)
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
