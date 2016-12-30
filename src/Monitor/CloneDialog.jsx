import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';


import { SourceFile } from '../File/';

const BundleTypes = [
  'embed',
  'divide',
  'cdn'
];

export default class DownloadDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    localization: PropTypes.object.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
  };

  state = {
    type: BundleTypes[0],
    composedFiles: null,
    error: null,
  };

  get title() {
    return (this.props.getConfig('env').TITLE || [''])[0];
  }

  componentDidMount() {

    Promise.all(this.props.files.map((file) => file.compose()))
      .then((composedFiles) => this.setState({ composedFiles }));

  }

  handleClone = () => {
    switch (this.state.type) {
      case 'embed':
        this.props.saveAs(SourceFile.embed({
          TITLE: this.title,
          files: this.state.composedFiles,
          coreString: this.props.coreString,
        }))
          .then(() => this.props.onRequestClose());
        break;
      case 'divide':
        this.props.saveAs(SourceFile.divide({
          TITLE: this.title,
          files: this.state.composedFiles,
        }));
        break;
      case 'cdn':
        this.props.saveAs(SourceFile.cdn({
          TITLE: this.title,
          files: this.state.composedFiles,
        }))
          .then(() => this.props.onRequestClose());
        break;
    }
  };

  handleCloneLibrary = () => {
    this.props.saveAs(SourceFile.library({
      coreString: this.props.coreString,
    }));
  };

  handleCloneAll = () => {
    Promise.resolve()
      .then(() => this.props.saveAs(
        SourceFile.library({
          coreString: this.props.coreString,
        }),
        SourceFile.divide({
          TITLE: this.title,
          files: this.state.composedFiles,
        })
      ))
      .then(() => this.props.onRequestClose());
  };

  handleChange = (event, type) => {
    this.setState({ type });
  };

  render() {
    const {
      onRequestClose,
      content,
      localization,
      coreString,
    } = this.props;
    const { type, composedFiles } = this.state;

    const styles = {
      button: {
        marginLeft: 16,
      },
      radio: {
        marginBottom: 16,
      },
      group: {
        padding: 24,
      },
      center: {
        textAlign: 'center',
      },
    };

    const actions = [
      type !== 'divide' ? (
        <RaisedButton primary
          label={localization.cloneDialog.save}
          disabled={!composedFiles || !coreString}
          style={styles.button}
          onTouchTap={this.handleClone}
        />
      ) : null,
      <FlatButton
        label={localization.cloneDialog.cancel}
        style={styles.button}
        onTouchTap={onRequestClose}
      />,
    ];

    const saveDivides = type === 'divide' ? (
      <div style={styles.center}>
        <RaisedButton primary
          label={localization.cloneDialog.saveHTML}
          disabled={!composedFiles}
          style={styles.button}
          onTouchTap={this.handleClone}
        />
        <RaisedButton primary
          label={localization.cloneDialog.saveLibrary}
          disabled={!coreString}
          style={styles.button}
          onTouchTap={this.handleCloneLibrary}
        />
        <RaisedButton primary
          label={localization.cloneDialog.saveAll}
          disabled={!coreString}
          style={styles.button}
          onTouchTap={this.handleCloneAll}
        />
      </div>
    ) : null;

    return (
      <Dialog
        title={localization.cloneDialog.title}
        modal={false}
        open={true}
        actions={actions}
        onRequestClose={onRequestClose}
      >
        <RadioButtonGroup
          name="libType"
          valueSelected={type}
          style={styles.group}
          onChange={this.handleChange}
        >
        {BundleTypes.map((type) => (
          <RadioButton
            key={type}
            value={type}
            label={localization.cloneDialog[type]}
            style={styles.radio}
          />
        ))}
        </RadioButtonGroup>
        {saveDivides}
      </Dialog>
    );
  }
}
