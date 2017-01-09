import React, { PureComponent, PropTypes } from 'react';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import { grey600 } from 'material-ui/styles/colors';
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box';
import ImageLooksOne from 'material-ui/svg-icons/image/looks-one';
import ContentFontDownload from 'material-ui/svg-icons/content/font-download';
import AvPlaylistAdd from 'material-ui/svg-icons/av/playlist-add';


import EnvItem from './EnvItem';

export default class EnvPane extends PureComponent {

  static propTypes = {
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  state = {
    env: this.props.getConfig('env'),
  };

  handleUpdateEnv = (change) => {
    const env = Object.assign({}, this.state.env, change);
    this.props.setConfig('env', env)
      .then((file) => file.json)
      .then((env) => this.setState({ env }));
  };

  addItem = (value, type, tooltip = '') => {
    this.handleUpdateEnv({ ['']: [value, type, tooltip] });
  };

  render() {
    const {
      localization,
    } = this.props;

    const styles = {
      root: {
        margin: 16,
      },
      actions: {
        textAlign: 'right',
      },
      label: {
        fontSize: '.5rem',
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
        <CardActions expandable
          style={styles.actions}
        >
          <AvPlaylistAdd color={grey600} />,
          <RaisedButton primary
            label="Bool"
            icon={<ToggleCheckBox />}
            labelStyle={styles.label}
            onTouchTap={() => this.addItem(false, 'boolean')}
          />
          <RaisedButton primary
            label="Number"
            icon={<ImageLooksOne />}
            labelStyle={styles.label}
            onTouchTap={() => this.addItem(0, 'number')}
          />
          <RaisedButton primary
            label="String"
            icon={<ContentFontDownload />}
            labelStyle={styles.label}
            onTouchTap={() => this.addItem('', 'string')}
          />
        </CardActions>
      </Card>
    );
  }
}
