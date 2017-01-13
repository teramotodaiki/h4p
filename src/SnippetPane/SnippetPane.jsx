import React, { PureComponent, PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import Chip from 'material-ui/Chip';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';

import SnippetButton from './SnippetButton';
import { configs } from '../File/';


export default class SnippetPane extends PureComponent {

  static propTypes = {
    tabs: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    snippets: [],
    snippetFiles: [],
    fileKey: '',
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
    const selected = nextProps.tabs
      .find((item) => item.isSelected);
    if (selected) {
      const snippets = this.props.getConfig('snippets')(selected.file);
      const snippetFiles = this.findSnippetFiles(snippets);

      this.setState({
        snippets,
        snippetFiles,
        fileKey: snippetFiles[0] && snippetFiles[0].key,
      });
    } else {
      this.setState({
        snippets: [],
        snippetFiles: [],
        fileKey: '',
      });
    }
  }

  findSnippetFiles(snippets) {
    return snippets
      .map((item) => item.fileKey)
      .filter((key, i, array) => array.indexOf(key) === i)
      .map((item) => this.props.findFile((file) => file.key === item));
  }

  handleSelectSnippet = (event, node) => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
      shownNode: node,
    });
  };

  renderChips() {
    const {
      palette,
    } = this.context.muiTheme;
    const styles = {
      bar: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      label: {
        fontSize: '.8rem',
        lineHeight: '1.4rem',
        marginLeft: 4,
      },
      activeColor: fade(palette.primary1Color, 0.3),
    };

    return (
      <div style={styles.bar}>
      {this.state.snippetFiles.map((file) => (
        <Chip
          key={file.key}
          backgroundColor={file.key === this.state.fileKey ? styles.activeColor : null}
          labelStyle={styles.label}
          onTouchTap={() => this.setState({ fileKey: file.key })}
        >{file.plane}</Chip>
      ))}
      </div>
    );
  }

  render() {
    const {
      findFile,
      localization,
    } = this.props;
    const {
      snippets,
      fileKey,
      snippetFiles,
    } = this.state;
    const styles = {
      root: {
        margin: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      },
      container: {
        maxHeight: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        boxSizing: 'border-box',
        justifyContent: 'flex-start',
      },
      popover: {
        width: 400,
        height: 200,
      },
    };

    const HasSnippets = snippets.length > 0;
    const subtitle = this.state.fileKey ?
      localization.snippet.subtitle :
      localization.snippet.fileNotSelected;

    return (
      <Card initiallyExpanded
        style={styles.root}
      >
        <CardHeader actAsExpander showExpandableButton
          title={localization.snippet.title}
          subtitle={subtitle}
        />
        <CardActions expandable >
        {this.renderChips()}
        </CardActions>
        <CardText expandable
          style={styles.container}
        >
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
        </CardText>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          onRequestClose={() => this.setState({ open: false })}
          style={styles.popover}
        >{this.state.shownNode}</Popover>
      </Card>
    );
  }
}
