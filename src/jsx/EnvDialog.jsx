import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import { grey600 } from 'material-ui/styles/colors';


import { EnvTypes } from '../js/env';

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

  renderItem = (props, index) => {
    const onChange = (value) => {
      if (props.type === EnvTypes.Number) {
        value = parseInt(value, 10);
      }
      const change = Object.assign({}, props, { value });
      this.updateEnv(change, index);
      this.props.updateEnv(change, index);
    };
    const childProps = Object.assign({}, props, { onChange });

    return (
      <EnvItem key={props.key} {...props} >
      {
        props.type === EnvTypes.Bool ? (<ConfigureCheckbox {...childProps} />) :
        props.type === EnvTypes.Number ? (<ConfigureText {...childProps} />) :
        props.type === EnvTypes.String ? (<ConfigureText {...childProps} />) : null
      }
      </EnvItem>
    )
  }

  render() {
    const { onRequestClose } = this.props;
    const { env } = this.state;

    return (
      <Dialog title="Configure env" modal={false} open={true} onRequestClose={onRequestClose}>
      {env.map(this.renderItem)}
      </Dialog>
    );
  }
}

const EnvItem = (props) => {
  const { keyName, value, tooltip, children } = props;

  const divStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    paddingTop: 12,
    paddingBottom: 12,
  };

  const keyStyle = {
    flex: '0 0 auto',
    minWidth: 160,
    marginRight: 12,
  };

  const valueStyle = {
    flex: '0 0 auto',
    marginRight: 12,
  };

  const tootipStyle = {
    flex: '1 0 auto',
    minWidth: 160,
    color: grey600,
    fontSize: '.8em',
  };

  return (
    <div style={divStyle}>
      <div style={keyStyle}>{keyName}</div>
      <div style={valueStyle}>{children}</div>
      <div style={tootipStyle}>{tooltip}</div>
    </div>
  );
};


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
