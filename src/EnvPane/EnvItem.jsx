import React, { PropTypes, Component } from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import ContentClear from 'material-ui/svg-icons/content/clear';


import EditableLabel from '../jsx/EditableLabel';

export default class EnvItem extends Component {

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

    const styles = {
      root: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 12,
      },
      key: {
        flex: '1 1 auto',
        maxWidth: 100,
      },
      value: {
        flex: '1 1 auto',
        margin: '0 4px',
      },
      tooltip: {
        flex: '1 1 auto',
        fontSize: '.8em',
        maxWidth: 140,
      },
      remove: {
        flex: '0 0 auto',
      },
    };

    return (
      <div style={styles.root}>
        <EditableLabel
          id="tf1"
          defaultValue={itemKey}
          style={styles.key}
          tapTwiceQuickly={localization.common.tapTwiceQuickly}
          onEditEnd={this.changeKey}
        />
        <div style={styles.value}>
          <Configurable
            type={type}
            value={value}
            onChange={this.changeValue}
          />
        </div>
        <EditableLabel
          id="tf2"
          defaultValue={tooltip}
          style={styles.tooltip}
          tapTwiceQuickly={localization.common.tapTwiceQuickly}
          onEditEnd={this.changeTooltip}
        />
        <IconButton
          tooltip="Remove"
          style={styles.remove}
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
          style={{ width: 100 }}
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
          style={{ width: 200 }}
          onChange={(e) => props.onChange(e.target.value)}
        />
      );
    default:
      return null;
  }
};
