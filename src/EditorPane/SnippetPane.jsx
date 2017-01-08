import React, { Component, PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert';
import transitions from 'material-ui/styles/transitions';


import SnippetButton from './SnippetButton';
import { configs } from '../File/';


const getStyle = (props, context, state) => {
  const {
    snippets,
  } = props;
  const {
    palette,
  } = context.muiTheme;
  const {
    collapse,
  } = state;

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
      paddingBottom: collapse ? 8 : 0,
    },
    container: {
      borderTop: `1px solid ${palette.borderColor}`,
      height: collapse ? 0 : 300,
      display: 'flex',
      flexWrap: 'wrap',
      overflow: 'scroll',
      boxSizing: 'border-box',
      justifyContent: 'flex-start',
      transition: transitions.easeOut(),
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
    popover: {
      width: 400,
      height: 200,
    },
  }
};

export default class SnippetPane extends Component {

  static propTypes = {
    snippets: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  static defaultProps = {
    snippets: [],
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  static defaultCollapse = false;

  state = {
    snippetFiles: this.findSnippetFiles(),
    fileKey: '',
    collapse: SnippetPane.defaultCollapse,
    open: false,
    anchorEl: null,
    shownNode: null,
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

  handleSwap = () => {
    const collapse = !this.state.collapse;
    SnippetPane.defaultCollapse = collapse;
    this.setState({ collapse });
  };

  handleSelectSnippet = (event, node) => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
      shownNode: node,
    });
  };

  handleSelectMenu = (fileKey) => {
    this.setState({
      fileKey,
      collapse: false,
    });
  };

  render() {
    const {
      snippets,
      findFile,
      localization,
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
      popover,
    } = getStyle(this.props, this.context, this.state);

    const menus = snippetFiles.map((file) => {
      const style = file.key === fileKey ? enabled : disabled;
      return (
        <span
          key={file.key}
          style={style}
          onTouchTap={() => this.handleSelectMenu(file.key)}
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
            onTouchTap={this.handleSwap}
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
              onSelect={this.handleSelectSnippet}
              localization={localization}
            />
          )
        )}
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          onRequestClose={() => this.setState({ open: false })}
          style={popover}
        >{this.state.shownNode}</Popover>
        </div>
      </div>
    );
  }
}
