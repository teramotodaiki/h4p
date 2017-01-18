import React, { PureComponent, PropTypes } from 'react';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit';


import { SourceFile } from '../File/';
import { Tab } from '../ChromeTab/';
import EnvItem from './EnvItem';

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
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files) {
      this.setState({
        env: this.props.getConfig('env'),
      });
    }
  }

  componentDidMount() {
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
    }
  }

  handleUpdateEnv = (change) => {
    const env = Object.assign({}, this.state.env, change);
    this.props.setConfig('env', env)
      .then((file) => file.json)
      .then((env) => this.setState({ env }));
  };

  handleEdit = () => {
    const getFile = () => this.props.findFile('.env');
    const tab = new Tab({ getFile });

    this.props.selectTab(tab);
  };

  render() {
    const {
      localization,
    } = this.props;

    const styles = {
      root: {
        margin: 16,
      },
    };

    return (
      <Card style={styles.root}>
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
          <FlatButton
            label={localization.common.editFile}
            icon={<EditorModeEdit />}
            onTouchTap={this.handleEdit}
          />
        </CardActions>
      </Card>
    );
  }
}
