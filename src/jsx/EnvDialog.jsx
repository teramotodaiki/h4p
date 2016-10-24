import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import { grey600 } from 'material-ui/styles/colors';


import { EnvTypes } from '../js/env';
import EditableLabel from './EditableLabel';

const NoDescription = 'No description';

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

    this.setState({
      env: index in env ?
        env.map((item, i) => i === index ? change : item) :
        env.concat(change)
    });
  };

  render() {
    const { updateEnv, onRequestClose } = this.props;
    const { env } = this.state;

    const handleChange = (change, index) => {
      this.updateEnv(change, index);
      updateEnv(change, index);
    };

    return (
      <Dialog title="Configure env" modal={false} open={true} onRequestClose={onRequestClose}>
      {env.map((item, index) => (
        <EnvItem
          key={item.key}
          item={item}
          onChange={change => handleChange(change, index)}
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
      if (item.type === EnvTypes.Number) {
        value = parseInt(value, 10);
      }
      const change = Object.assign({}, item, { value });
      onChange(change);
    };
    const childProps = { value: item.value, onChange: handleChange };

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
      flexWrap: 'wrap',
      height: 42,
      paddingTop: 12,
      paddingBottom: 12,
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
          defaultValue={tooltip || NoDescription}
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
    onChange={e => props.onChange(e.target.value)}
  />
);
