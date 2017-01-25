import React, { PureComponent, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';


import { SourceFile } from '../File/';
import { commonRoot } from './commonStyles';
import EditFile from './EditFile';
import resolveOrigin from '../utils/resolveOrigin';

export default class EditorCard extends PureComponent {

  static propTypes = {
    files: PropTypes.array.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
  };

  state = {
    editorFileKey: '',
    cssFileKey: '',
  };

  componentWillMount() {

    (async() => {

      const editorFileKey = await this.addFileIfNotExist(
        'feeles/codemirror.json',
        () => {
          const editor = this.props.getConfig('codemirror');
          return new SourceFile({
            type: 'application/json',
            name: 'feeles/codemirror.json',
            text: JSON.stringify(editor, null, '\t'),
          });
        }
      );

      const cssFileKey = await this.addFileIfNotExist(
        'feeles/codemirror.css',
        () => {
          new SourceFile({
            type: 'text/css',
            name: 'feeles/codemirror.css',
            text: '',
          })
        }
      );

      this.setState({
        editorFileKey,
        cssFileKey,
      });

    })();

  }

  async addFileIfNotExist(name, getFile) {

    const file = this.props.findFile(name);

    if (!file) {
      const nextFile = await this.props.addFile(getFile());
      return nextFile.key;
    }

    return file.key;

  }

  componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files) {
      const editorFile = this.props.findFile('feeles/codemirror.json');
      this.setState({
        editorFileKey: editorFile ? editorFile.key : '',
      });
    }
  }

  renderBlock(title, href, fileKey) {
    const {
      localization,
    } = this.props;

    const subtitle = [
      <span key={1}>{title + ' - '}</span>,
      <a key={2} href={href} target="blank">{resolveOrigin(href)}</a>
    ];

    const styles = {
      block: {
        whiteSpace: 'inherit',
      },
    };

    return (
      <CardHeader expandable
        style={styles.block}
        title={title}
        subtitle={subtitle}
      >
        <EditFile
          fileKey={fileKey}
          findFile={this.props.findFile}
          selectTab={this.props.selectTab}
          localization={localization}
        />
      </CardHeader>
    );
  }

  render() {
    const {
      localization,
    } = this.props;

    return (
      <Card style={commonRoot}>
        <CardHeader showExpandableButton actAsExpander
          title={localization.editorCard.title}
          subtitle={localization.editorCard.subtitle}
        />
        {this.renderBlock(
          localization.editorCard.editor,
          'http://codemirror.net/doc/manual.html#config',
          this.state.editorFileKey
        )}
        {this.renderBlock(
          localization.editorCard.style,
          'http://codemirror.net/doc/manual.html#styling',
          this.state.cssFileKey
        )}
      </Card>
    );
  }
}
