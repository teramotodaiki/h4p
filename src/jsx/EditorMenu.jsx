import React, { Component, PropTypes } from 'react';
import { FloatingActionButton, Checkbox } from 'material-ui';
import HardwareKeyboardTab from 'material-ui/svg-icons/hardware/keyboard-tab';
import ContentAdd from 'material-ui/svg-icons/content/add';


import { DialogTypes } from './FileDialog/';

export default class EditorMenu extends Component {

  static propTypes = {
    editorOptions: PropTypes.object.isRequired,
    handleEditorOptionChange: PropTypes.func.isRequired,
    handleOpenDialog: PropTypes.func.isRequired,
  };

  toggleTabVisibility = (event, tabVisibility) => {
    this.props.handleEditorOptionChange({ tabVisibility });
  };

  handleAdd = () => {
    this.props.handleOpenDialog(DialogTypes.Add);
  };

  render() {
    const style = Object.assign({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 20,
      zIndex: 1,
    }, this.props.style);

    const addButtonStyle = {
      margin: '2px 6px -10px 0px',
    };

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
        <FloatingActionButton
          mini={true}
          style={addButtonStyle}
          onClick={this.handleAdd}
        >
          <ContentAdd />
        </FloatingActionButton>
      </div>
    );
  }
}
