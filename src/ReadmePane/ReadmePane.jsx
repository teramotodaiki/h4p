import React, { Component, PropTypes } from 'react';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import DropDownMenu from 'material-ui/DropDownMenu';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit';


import { Readme } from '../EditorPane/';
import { SourceFile } from '../File/';
import { Tab } from '../ChromeTab/';

export default class ReadmePane extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    port: PropTypes.object,
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
      nextProps.port.addEventListener('message', (event) => {
        if (event.data.query === 'complete') {
          this.setState({
            completes: event.data.value,
          });
        }
      });
    }
  }

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

  handleEdit = () => {
    const {
      selectedFile,
    } = this.state;
    const getFile = () => this.props.findFile((file) => (
      file.key === selectedFile.key
    ));
    const tab = new Tab({ getFile });

    this.props.selectTab(tab);
  };

  renderDropDownMenu() {
    const {
      selectedFile,
    } = this.state;

    const markdowns = this.props.files
      .filter((item) => item.is('markdown'));

    const styles = {
      underline: {
        display: 'none',
      },
    };

    return (
      <DropDownMenu
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
    );
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
      root: {
        margin: 16,
      },
      text: {
        paddingTop: 0,
      },
    };
    return (
      <Card initiallyExpanded
        style={styles.root}
      >
        <CardHeader showExpandableButton actAsExpander
          title={selectedFile.header}
          subtitle={localization.readme.subtitle}
        />
        <CardText
          expandable
          style={styles.text}
        >
          <Readme
            file={selectedFile}
            selectTab={this.props.selectTab}
            findFile={this.props.findFile}
            addFile={this.props.addFile}
            getConfig={this.props.getConfig}
            localization={this.props.localization}
            completes={this.state.completes}
            onShot={this.handleShot}
          />
        </CardText>
        <CardActions expandable >
        {this.renderDropDownMenu()}
          <FlatButton
            label={localization.readme.edit}
            icon={<EditorModeEdit />}
            onTouchTap={this.handleEdit}
          />
        </CardActions>

      </Card>
    );
  }
}
