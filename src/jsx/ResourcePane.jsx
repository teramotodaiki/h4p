import React, { Component, PropTypes } from 'react';
import { List, ListItem } from 'material-ui';


import blobUrlLoader from '../js/blobUrlLoader';

export default class ResourcePane extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    handleSelectFile: PropTypes.func.isRequired,
    selectedFile: PropTypes.object,
  };

  constructor(props) {
    super(props);
  }

  handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    files.map(file => {
      const mimeType = file.type;
      const filename = file.name;
      const extBegin = filename.lastIndexOf('.');
      const name = extBegin > 0 ? filename.substr(0, extBegin) : filename;

      blobUrlLoader(file)
      .then(code => this.props.addFile({ name, filename, code }))
      .catch((err) => alert(`Failed to load the file ${file.name}!`));
    });
  };

  handleDragOver = (event) => {
    event.preventDefault();
  };
  
  render() {
    const { files, handleSelectFile } = this.props;

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
            onTouchTap={() => handleSelectFile(file)}
          />
        ))}
        </List>
        <div>Drag and Drop here.</div>
      </div>
    );
  }
}
