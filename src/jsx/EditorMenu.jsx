import React, { Component, PropTypes } from 'react';
import { Checkbox } from 'material-ui';
import HardwareKeyboardTab from 'material-ui/svg-icons/hardware/keyboard-tab';


export default class EditorMenu extends Component {

  static propTypes = {
    editorOptions: PropTypes.object.isRequired,
  };

  toggleTabVisibility = (event, tabVisibility) => {
    this.props.handleEditorOptionChange({ tabVisibility });
  };

  render() {
    const style = Object.assign({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 20,
      zIndex: 1,
    }, this.props.style);

    return (
      <div style={style}>
        <div>
          <Checkbox
            checkedIcon={<HardwareKeyboardTab />}
            uncheckedIcon={<HardwareKeyboardTab />}
            onCheck={this.toggleTabVisibility}
            style={{ width: 'auto' }}
          />
        </div>
      </div>
    );
  }
}
