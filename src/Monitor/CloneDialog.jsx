import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import {Tabs, Tab} from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';


import { SourceFile } from '../File/';

const BundleTypes = [
  'embed',
  'divide',
  'cdn'
];

export default class CloneDialog extends Component {

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
    bundleType: BundleTypes[0],
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
    switch (this.state.bundleType) {
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

  handleBundleTypeChange = (event, bundleType) => {
    this.setState({ bundleType });
  };

  render() {
    const {
      onRequestClose,
      content,
      localization,
      coreString,
    } = this.props;
    const { bundleType, composedFiles } = this.state;

    const styles = {
      body: {
        padding: 0,
      },
      button: {
        marginLeft: 16,
      },
      header: {
        marginLeft: 24,
      },
      container: {
        margin: 16,
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

    const actions =  [
      <FlatButton
        label={localization.cloneDialog.cancel}
        style={styles.button}
        onTouchTap={onRequestClose}
      />,
    ];

    return (
      <Dialog open
        bodyStyle={styles.body}
        actions={actions}
        onRequestClose={onRequestClose}
      >
        <Tabs>
          <Tab label={localization.cloneDialog.saveTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.saveHeader}</h1>
            <div style={styles.container}>
              Save
            </div>
          </Tab>
          <Tab label={localization.cloneDialog.loadTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.loadHeader}</h1>
            <div style={styles.container}>
              Load
            </div>
          </Tab>
          <Tab label={localization.cloneDialog.cloneTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.cloneHeader}</h1>
            <RadioButtonGroup
              name="libType"
              valueSelected={bundleType}
              style={styles.group}
              onChange={this.handleBundleTypeChange}
            >
            {BundleTypes.map((type) => (
              <RadioButton
                key={type}
                value={type}
                label={localization.cloneDialog[type]}
                style={styles.radio}
              />
            ))}
            </RadioButtonGroup>,
          {bundleType === 'divide' ? (
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
          ) : (
            <RaisedButton primary
              label={localization.cloneDialog.save}
              disabled={!composedFiles || !coreString}
              style={styles.button}
              onTouchTap={this.handleClone}
            />
          )}
          </Tab>
        </Tabs>
      </Dialog>
    );
  }
}
