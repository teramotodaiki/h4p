import React, { Component, PropTypes } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';


import { Readme } from '../EditorPane/';
import { SourceFile } from '../File/';

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
        console.log(selectedFile);
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

  resolveFile(key) {
    if (!key) {
      return null;
    }
    return this.props.findFile((item) => item.key === key);
  }

  render() {
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
    };
    return (
      <Card initiallyExpanded
        style={styles.root}
      >
        <CardHeader showExpandableButton
          title="README"
          subtitle={<div>{selectedFile.header}</div>}
        />
        <CardText expandable >
          <Readme
            file={selectedFile}
            selectTab={this.props.selectTab}
            findFile={this.props.findFile}
            addFile={this.props.addFile}
            getConfig={this.props.getConfig}
            localization={this.props.localization}
            port={this.props.port}
            onShot={this.handleShot}
          />
        </CardText>

      </Card>
    );
  }
}
