import React, { PureComponent, PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';
import Chip from 'material-ui/Chip';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';


import SnippetPane from '../SnippetPane/';
import { configs } from '../File/';
import { commonRoot } from './commonStyles';
import EditFile from './EditFile';

export default class SnippetCard extends PureComponent {

  static propTypes = {
    tabs: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    snippets: [],
    snippetFiles: [],
    fileKey: '',
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
    const snippets = selected && this.props.getConfig('snippets')(selected.file);

    if (snippets && snippets.length) {
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

  renderChips() {
    const {
      palette,
    } = this.context.muiTheme;
    const styles = {
      bar: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      chip: {
        marginRight: 2,
        marginBottom: 4,
      },
      label: {
        fontSize: '.8rem',
        lineHeight: '1.4rem',
      },
      activeColor: fade(palette.primary1Color, 0.3),
    };

    return (
      <div style={styles.bar}>
      {this.state.snippetFiles.map((file) => (
        <Chip
          key={file.key}
          backgroundColor={file.key === this.state.fileKey ? styles.activeColor : null}
          style={styles.chip}
          labelStyle={styles.label}
          onTouchTap={() => this.setState({ fileKey: file.key })}
        >{file.plane}</Chip>
      ))}
      </div>
    );
  }

  render() {
    const {
      localization,
    } = this.props;

    const subtitle = this.state.fileKey ?
      localization.snippet.subtitle :
      localization.snippet.fileNotSelected;

    return (
      <Card initiallyExpanded
        style={commonRoot}
      >
        <CardHeader actAsExpander showExpandableButton
          title={localization.snippet.title}
          subtitle={subtitle}
        />
        <CardActions expandable >
        {this.renderChips()}
        </CardActions>
        <CardText expandable >
          <SnippetPane
            snippets={this.state.snippets}
            fileKey={this.state.fileKey}
            findFile={this.props.findFile}
            localization={localization}
          />
        </CardText>
        <CardActions expandable >
          <EditFile
            fileKey={this.state.fileKey}
            findFile={this.props.findFile}
            selectTab={this.props.selectTab}
            localization={localization}
          />
        </CardActions>
      </Card>
    );
  }
}
