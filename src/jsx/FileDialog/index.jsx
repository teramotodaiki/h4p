import React, { Component, PropTypes } from 'react';


const DialogTypes = {
  Add: 'Add',
  Save: 'Save',
  Rename: 'Rename',
  Delete: 'Delete',
};

import AddDialog from './AddDialog';
import SaveDialog from './SaveDialog';
import RenameDialog from './RenameDialog';
import DeleteDialog from './DeleteDialog';


export default class FileDialog extends Component {

  state = {
    dialogInstance: null,
  };

  open = (type, props) =>
    new Promise((resolve, reject) => {
      props = Object.assign({}, this.props, props, {
        resolve, reject,
        onRequestClose: this.close,
      });
      const dialogInstance = getDialogInstance(type, props);
      this.setState({ dialogInstance });
    });

  close = () => this.setState({ dialogInstance: null });

  render () {
    return this.state.dialogInstance;
  }

}

const getDialogInstance = (type, props) => {
  switch (type) {

    case DialogTypes.Add:
      return (<AddDialog {...props} />);

    case DialogTypes.Save:
      return (<SaveDialog {...props} />);

    case DialogTypes.Rename:
      return (<RenameDialog {...props} />);

    case DialogTypes.Delete:
      return (<DeleteDialog {...props} />);

    default: return null;
  }
};

export {
  DialogTypes,
  AddDialog,
  SaveDialog,
  RenameDialog,
  DeleteDialog,
  getDialogInstance,
};
