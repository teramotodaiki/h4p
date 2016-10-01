import React, { Component, PropTypes } from 'react';
import { List, ListItem } from 'material-ui';


import { DialogTypes } from './FileDialog/';
import blobUrlLoader from '../js/blobUrlLoader';

export default class ResourcePane extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    selectFile: PropTypes.func.isRequired,
    selectedFile: PropTypes.object,
    openFileDialog: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
  }

  handleDrop = (event) => {
    const { addFile, openFileDialog } = this.props;
    event.preventDefault();

    Array.from(event.dataTransfer.files)
    .map(file => {
      const mimeType = file.type;
      const filename = file.name;
      const extBegin = filename.lastIndexOf('.');
      const name = extBegin > 0 ? filename.substr(0, extBegin) : filename;
      const content = { name };

      return () => Promise.resolve()
        .then(() => openFileDialog(DialogTypes.Sign, { content }))
        .then(author => {
          blobUrlLoader(file)
            .then(code => addFile({ name, filename, code, author }));
        });
    })
    .reduce((p, c) => {
      return p.then(c);
    }, Promise.resolve())
    .catch(err => {
      console.error(err);
    });
  };

  handleDragOver = (event) => {
    event.preventDefault();
  };

  handleSelectFile = (file) => {
    this.props.selectFile(file);
  };

  render() {
    const { files, selectFile } = this.props;

    const style = Object.assign({
      backgroundColor: 'rgb(247,247,247)',
    }, this.props.style);

    return (
      <div
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
        style={style}
      >
        <List>
        {files.map(file => (
          <ListItem
            key={file.key}
            primaryText={file.name}
            disableKeyboardFocus={true}
            onTouchTap={() => this.handleSelectFile(file)}
          />
        ))}
        </List>
        <div>Drag and Drop here.</div>
      </div>
    );
  }
}
