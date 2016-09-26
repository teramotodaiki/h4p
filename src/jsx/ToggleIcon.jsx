import React from 'react';
import Checkbox from 'material-ui/Checkbox';

const ToggleIcon = props => (
  <Checkbox
    checkedIcon={props.enable}
    uncheckedIcon={props.disable}
    onCheck={props.onChange}
    style={{
      width: 'auto',
      display: 'inline-block',
      top: '8px'
    }}
  />
);

export default ToggleIcon;
