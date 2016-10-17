import React, { Component, PropTypes } from 'react';
import { Paper } from 'material-ui';
import { faintBlack, white, darkWhite } from 'material-ui/styles/colors';


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

  state = {
    selections: []
  };

  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedFile } = nextProps;
    if (this.props.selectedFile !== selectedFile && selectedFile) {
      const selections = this.state.selections.concat(selectedFile.key);
      this.setState({ selections });
    }
  }

  handleDrop = (event) => {
    const { addFile, selectFile, openFileDialog } = this.props;
    event.preventDefault();

    Array.from(event.dataTransfer.files)
    .map(file => () => {
      const content = { name: file.name };
      return Promise.all([
        makeFromFile(file),
        openFileDialog(DialogTypes.Sign, { content })
      ])
      .then(([file, author]) => Object.assign({}, file, { author }))
      .then(addFile)
      .then(selectFile);
    })
    .reduce((p, c) => {
      return p.then(c);
    }, Promise.resolve());
  };

  handleDragOver = (event) => {
    event.preventDefault();
  };

  handleSelectFile = (file) => {
    const { selections } = this.state;
    if (this.state.selections.indexOf(file.key) > -1) {
      this.setState({
        selections: selections.filter(key => key !== file.key)
      });
    } else {
      this.setState({
        selections: selections.concat(file.key)
      })
    }
    this.props.selectFile(file);
  };

  render() {
    const { files, selectFile, selectedFile } = this.props;
    const { selections } = this.state;

    const style = Object.assign({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      backgroundColor: faintBlack,
      padding: '3rem 0',
    }, this.props.style);

    const selectOne = (file, passed, abort) => selectedFile === file ? passed : abort;
    const select = (file, passed, abort) => selections.indexOf(file.key) > -1 ? passed : abort;

    const itemStyle = (file) => Object.assign({
      boxSizing: 'border-box',
      marginTop: '.8rem',
      marginRight: selectOne(file, 0, '1rem'),
      marginLeft: '1rem',
      padding: '.25rem',
      height: '2.5rem',
      borderTopRightRadius: selectOne(file, 0, 2),
      borderBottomRightRadius: selectOne(file, 0, 2),
      backgroundColor: select(file, white, darkWhite),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    });

    return (
      <div
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
        style={style}
      >
        {files.map(file => (
          <Paper
            key={file.key}
            zDepth={select(file, 2, 0)}
            onTouchTap={() => this.handleSelectFile(file)}
            style={itemStyle(file)}
          >
          {file.name}
          </Paper>
        ))}
        <div>Drag and Drop here.</div>
      </div>
    );
  }
}
