import React, { PureComponent, PropTypes } from 'react';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';


import ReadmePane from '../ReadmePane/';
import { SourceFile } from '../File/';
import { commonRoot } from './commonStyles';
import EditFile from './EditFile';
import shallowEqual from '../utils/shallowEqual';

export default class ReadmeCard extends PureComponent {

  static propTypes = {
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    port: PropTypes.object,
    setLocation: PropTypes.func.isRequired,
  };

  state = {
    selectedFile: null,
    completes: [],
  };

  componentDidMount() {
    Promise.resolve()
      .then(() => {
        const readme = this.props.findFile('README.md');
        if (readme) {
          return Promise.resolve(readme);
        }

        return this.props.addFile(
          new SourceFile({
            type: 'text/x-markdown',
            name: 'README.md',
            text: this.props.localization.readme.text,
          })
        );
      })
      .then((selectedFile) => {
        this.setState({ selectedFile });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.files !== nextProps.files &&
      this.state.selectedFile
    ) {
      const key = this.state.selectedFile.key;
      this.setState({
        selectedFile: this.resolveFile(key),
      });
    }

    if (this.props.port !== nextProps.port) {
      if (this.props.port) {
        this.props.port.removeEventListener('message', this.handleMessage);
      }
      if (nextProps.port) {
        nextProps.port.addEventListener('message', this.handleMessage);
      }
    }
  }

  handleMessage = (event) => {
    if (!event.data || !event.data.query) return;
    const { query, value } = event.data;

    // Completes
    if (query === 'complete') {
      if (!shallowEqual(value, this.state.completes)) {
        this.setState({
          completes: value,
        });
      }
    }
    // Readme
    if (query === 'readme') {
      const selectedFile = this.props.findFile(value);
      if (!selectedFile) {
        throw `Not Found Error: feeles.openReamde("${value}")`;
      }
      this.setState({ selectedFile });
    }
  };

  handleShot = (text) => {
    if (this.props.port) {
      const babelrc = this.props.getConfig('babelrc');
      return Promise.resolve()
        .then(() => SourceFile.shot(text).babel(babelrc))
        .then((file) => {
          this.props.port.postMessage({
            query: 'shot',
            value: file.serialize(),
          });
        });
    }
    return Promise.reject();
  };

  handleSelect = (event, index, value) => {
    this.setState({
      selectedFile: this.resolveFile(value),
    });
  };

  resolveFile(key) {
    if (!key) {
      return null;
    }
    return this.props.findFile((item) => item.key === key);
  }

  renderDropDownMenu() {
    const {
      localization,
    } = this.props;
    const {
      selectedFile,
    } = this.state;

    const markdowns = this.props.files
      .filter((item) => item.is('markdown'))
      .sort((a, b) => a.header > b.header ? 1 : -1);

    const styles = {
      index: {
        marginLeft: 16,
        marginRight: -8,
        fontSize: '.5rem',
      },
      underline: {
        display: 'none',
      },
    };

    return [
      <span key="index" style={styles.index}>
      {localization.readme.index}
      </span>,
      <DropDownMenu key="dropDown"
        value={selectedFile.key}
        underlineStyle={styles.underline}
        onChange={this.handleSelect}
      >
      {markdowns.map((file) => (
        <MenuItem
          key={file.key}
          value={file.key}
          primaryText={file.header}
        />
      ))}
      </DropDownMenu>
    ];
  }

  render() {
    const {
      localization,
    } = this.props;
    const {
      selectedFile,
    } = this.state;

    if (!selectedFile) {
      return null;
    }

    const styles = {
      text: {
        paddingTop: 0,
      },
    };
    return (
      <Card initiallyExpanded
        style={commonRoot}
      >
        <CardHeader showExpandableButton actAsExpander
          title={selectedFile.header}
          subtitle={localization.readme.subtitle}
        />
        <CardText
          expandable
          style={styles.text}
        >
          <ReadmePane
            file={selectedFile}
            selectTab={this.props.selectTab}
            findFile={this.props.findFile}
            addFile={this.props.addFile}
            getConfig={this.props.getConfig}
            localization={this.props.localization}
            completes={this.state.completes}
            onShot={this.handleShot}
            setLocation={this.props.setLocation}
          />
        </CardText>
        <CardActions expandable >
        {this.renderDropDownMenu()}
          <EditFile
            fileKey={selectedFile.key}
            findFile={this.props.findFile}
            selectTab={this.props.selectTab}
            localization={localization}
          />
        </CardActions>
      </Card>
    );
  }
}
