import React, { Component, PropTypes } from 'react';
import { List, ListItem } from 'material-ui';
import { faintBlack } from 'material-ui/styles/colors';


import { DialogTypes } from './FileDialog/';
import { makeFromFile } from '../js/files';

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
    .map(file => () => {
      const content = { name: file.name };
      return Promise.all([
        makeFromFile(file),
        openFileDialog(DialogTypes.Sign, { content })
      ])
      .then(([file, author]) => Object.assign({}, file, { author }))
      .then(addFile);
    })
    .reduce((p, c) => {
      return p.then(c);
    }, Promise.resolve());
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
      backgroundColor: faintBlack,
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
