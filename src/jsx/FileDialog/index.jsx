import React from 'react';


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

export {
  DialogTypes,
  AddDialog,
  SaveDialog,
  RenameDialog,
  DeleteDialog,
};

export default (props) => {
  switch (props.type) {

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
