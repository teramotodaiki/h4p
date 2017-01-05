import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import { grey600 } from 'material-ui/styles/colors';
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box';
import ImageLooksOne from 'material-ui/svg-icons/image/looks-one';
import ContentFontDownload from 'material-ui/svg-icons/content/font-download';
import ContentClear from 'material-ui/svg-icons/content/clear';
import AvPlaylistAdd from 'material-ui/svg-icons/av/playlist-add';


import EditableLabel from '../jsx/EditableLabel';

export default class EnvDialog extends Component {

  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
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
      updateEnv,
      onRequestClose,
      localization,
    } = this.props;
    const { env } = this.state;

    const containerStyle = {
      overflow: 'scroll',
    };

    const actionStyle = {
      marginLeft: 12,
    };

    const addActions = [
      <AvPlaylistAdd color={grey600} />,
      <RaisedButton primary
        label="Bool"
        icon={<ToggleCheckBox />}
        style={actionStyle}
        onTouchTap={() => this.addItem(false, 'boolean')}
      />,
      <RaisedButton primary
        label="Number"
        icon={<ImageLooksOne />}
        style={actionStyle}
        onTouchTap={() => this.addItem(0, 'number')}
      />,
      <RaisedButton primary
        label="String"
        icon={<ContentFontDownload />}
        style={actionStyle}
        onTouchTap={() => this.addItem('', 'string')}
      />,
    ];

    return (
      <Dialog open
        title={localization.envDialog.title}
        modal={false}
        actions={addActions}
        onRequestClose={onRequestClose}
        bodyStyle={containerStyle}
      >
      {Object.keys(env).map((key) => (
        <EnvItem
          key={key}
          itemKey={key}
          item={env[key]}
          localization={localization}
          updateEnv={this.handleUpdateEnv}
        />
      ))}
      </Dialog>
    );
  }
}

class EnvItem extends Component {

  static propTypes = {
    item: PropTypes.array.isRequired,
    itemKey: PropTypes.any.isRequired,
    updateEnv: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  changeKey = (key) => {
    const { itemKey, updateEnv } = this.props;
    const [...item] = this.props.item;

    updateEnv({
      [itemKey]: undefined,
      [key]: item
    });
  };

  changeValue = (value) => {
    const { itemKey, updateEnv } = this.props;
    const [, type, tooltip] = this.props.item;

    const item = [value, type, tooltip];
    updateEnv({ [itemKey]: item });
  };

  changeTooltip = (tooltip) => {
    const { itemKey, updateEnv } = this.props;
    const [value, type] = this.props.item;

    const item = [value, type, tooltip];
    updateEnv({ [itemKey]: item });
  };

  removeItem = () => {
    const { itemKey, updateEnv } = this.props;
    updateEnv({ [itemKey]: undefined });
  };

  render() {
    const {
      itemKey,
      localization,
    } = this.props;
    const [value, type, tooltip] = this.props.item;

    const divStyle = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 12,
      paddingBottom: 12,
      height: 48
    };

    const keyStyle = {
      minWidth: 100,
      marginRight: 12
    };

    const valueStyle = {
      marginRight: 12,
    };

    const tooltipStyle = {
      minWidth: 100,
      color: grey600,
      fontSize: '.8em',
    };

    return (
      <div style={divStyle}>
        <EditableLabel
          id="tf1"
          defaultValue={itemKey}
          style={keyStyle}
          tapTwiceQuickly={localization.common.tapTwiceQuickly}
          onEditEnd={this.changeKey}
        />
        <div style={valueStyle}>
          <Configurable
            type={type}
            value={value}
            onChange={this.changeValue}
          />
        </div>
        <EditableLabel
          id="tf2"
          defaultValue={tooltip}
          style={tooltipStyle}
          tapTwiceQuickly={localization.common.tapTwiceQuickly}
          onEditEnd={this.changeTooltip}
        />
        <IconButton
          tooltip="Remove"
          onTouchTap={this.removeItem}
        >
          <ContentClear />
        </IconButton>
      </div>
    );
  }
}

const Configurable = (props) => {
  switch (props.type) {
    case 'boolean':
      return (
        <Checkbox
          defaultChecked={props.value}
          style={{ width: 40 }}
          onCheck={(e, value) => props.onChange(value)}
        />
      );
    case 'number':
      return (
        <TextField
          id="tf"
          defaultValue={props.value}
          inputStyle={{ textAlign: 'right' }}
          onChange={(e) => {
            const float = parseFloat(e.target.value);
            if (!isNaN(float)) {
              props.onChange(float);
            }
          }}
        />
      );
    case 'string':
      return (
        <TextField multiLine
          id="tf"
          defaultValue={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      );
    default:
      return null;
  }
};
