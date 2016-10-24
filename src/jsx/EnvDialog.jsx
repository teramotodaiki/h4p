import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import { grey600 } from 'material-ui/styles/colors';
import ToggleCheckBox from 'material-ui/svg-icons/toggle/check-box';
import ImageLooksOne from 'material-ui/svg-icons/image/looks-one';
import ContentFontDownload from 'material-ui/svg-icons/content/font-download';
import AvPlaylistAdd from 'material-ui/svg-icons/av/playlist-add';


import { makeEnv, validateEnv, EnvTypes } from '../js/env';
import EditableLabel from './EditableLabel';

const InvalidValue = 'Invalid value';

export default class EnvDialog extends Component {

  static propTypes = {
    env: PropTypes.array.isRequired,
    updateEnv: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  };

  state = {
    env: [].concat(this.props.env)
  };

  updateEnv = (change, index = -1) => {
    const { env } = this.state;
    const { updateEnv } = this.props;

    this.setState({
      env: index in env ?
        env.map((item, i) => i === index ? change : item) :
        env.concat(change)
    });
    updateEnv(change, index);
  };

  render() {
    const { onRequestClose } = this.props;
    const { env } = this.state;

    const actionStyle = {
      marginLeft: 12,
    };

    const addActions = [
      <AvPlaylistAdd color={grey600} />,
      <RaisedButton primary
        label="Bool"
        icon={<ToggleCheckBox />}
        style={actionStyle}
        onTouchTap={() => this.updateEnv(makeEnv('', false))}
      />,
      <RaisedButton primary
        label="Number"
        icon={<ImageLooksOne />}
        style={actionStyle}
        onTouchTap={() => this.updateEnv(makeEnv('', 0))}
      />,
      <RaisedButton primary
        label="String"
        icon={<ContentFontDownload />}
        style={actionStyle}
        onTouchTap={() => this.updateEnv(makeEnv('', ''))}
      />,
    ];

    return (
      <Dialog
        title="Configure Environment Variables"
        modal={false}
        open
        actions={addActions}
        onRequestClose={onRequestClose}
      >
      {env.map((item, index) => (
        <EnvItem
          key={item.key}
          item={item}
          onChange={change => this.updateEnv(change, index)}
        />
      ))}
      </Dialog>
    );
  }
}

class EnvItem extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };

  handleKeyNameChange = (event) => {
    const { item, onChange } = this.props;

    const keyName = event.target.value;
    const change = Object.assign({}, item, { keyName });
    onChange(change);
  };

  handleTooltipChange = (event) => {
    const { item, onChange } = this.props;

    const tooltip = event.target.value;
    const change = Object.assign({}, item, { tooltip });
    onChange(change);
  };

  renderConfiguable = () => {
    const { item, onChange } = this.props;

    const handleChange = (value) => {
      onChange(Object.assign({}, item, { value }));
    };
    const childProps = Object.assign(
      {
        value: item.value,
        onChange: handleChange
      },
      validateEnv(item) ? {} : {
        errorText: InvalidValue
      }
    );

    return (
      item.type === EnvTypes.Bool ? (<ConfigureCheckbox {...childProps} />) :
      item.type === EnvTypes.Number ||
      item.type === EnvTypes.String ? (<ConfigureText {...childProps} />) : null
    );
  };

  render() {
    const { keyName, value, tooltip } = this.props.item;

    const divStyle = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 12,
      paddingBottom: 12,
      height: 48
    };

    const keyStyle = {
      flex: '0 0 auto',
      minWidth: 160,
      marginRight: 12
    };

    const valueStyle = {
      flex: '0 0 auto',
      marginRight: 12,
    };

    const tooltipStyle = {
      flex: '1 0 auto',
      minWidth: 160,
      color: grey600,
      fontSize: '.8em',
    };

    return (
      <div style={divStyle}>
        <EditableLabel
          id="tf1"
          defaultValue={keyName}
          style={keyStyle}
          onChange={this.handleKeyNameChange}
        />
        <div style={valueStyle}>
        {this.renderConfiguable()}
        </div>
        <EditableLabel
          id="tf2"
          defaultValue={tooltip}
          style={tooltipStyle}
          onChange={this.handleTooltipChange}
        />
      </div>
    );
  }
}

const ConfigureCheckbox = (props) => (
  <Checkbox
    checked={props.value}
    style={{ width: 40 }}
    onCheck={(e, value) => props.onChange(value)}
  />
);

const ConfigureText = (props) => (
  <TextField
    id="tf"
    value={props.value}
    errorText={props.errorText}
    onChange={e => props.onChange(e.target.value)}
  />
);
