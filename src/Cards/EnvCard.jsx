import React, { PureComponent, PropTypes } from 'react';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';


import { SourceFile } from '../File/';
import { Tab } from '../ChromeTab/';
import EnvItem from './EnvItem';
import { commonRoot } from './commonStyles';
import EditFile from './EditFile';

export default class EnvPane extends PureComponent {

  static propTypes = {
    files: PropTypes.array.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
  };

  state = {
    env: this.props.getConfig('env'),
    fileKey: '',
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files) {
      const envFile = this.props.findFile('.env');
      this.setState({
        env: this.props.getConfig('env'),
        fileKey: envFile ? envFile.key : '',
      });
    }
  }

  componentWillMount() {
    const envFile = this.props.findFile('.env');
    if (!envFile) {
      const env = this.props.getConfig('env');
      this.props.addFile(
        new SourceFile({
          type: 'application/json',
          name: '.env',
          text: JSON.stringify(env, null, '\t'),
        })
      );
    } else {
      this.setState({
        fileKey: envFile.key,
      });
    }
  }

  handleUpdateEnv = (change) => {
    const env = Object.assign({}, this.state.env, change);
    this.props.setConfig('env', env)
      .then((file) => file.json)
      .then((env) => this.setState({ env }));
  };

  render() {
    const {
      localization,
    } = this.props;

    return (
      <Card style={commonRoot}>
        <CardHeader showExpandableButton actAsExpander
          title={localization.env.title}
          subtitle={localization.env.subtitle}
        />
        <CardText expandable >
        {Object.keys(this.state.env).map((key) => (
          <EnvItem
            key={key}
            itemKey={key}
            item={this.state.env[key]}
            localization={localization}
            updateEnv={this.handleUpdateEnv}
          />
        ))}
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
