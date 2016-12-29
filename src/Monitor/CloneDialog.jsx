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
    bundle: PropTypes.func.isRequired,
    inlineScriptId: PropTypes.string,
  };

  state = {
    type: BundleTypes[0],
    composedFiles: null,
    coreString: null,
    error: null,
  };

  get fileName() {
    const [TITLE] = this.props.getConfig('env').TITLE || [''];
    return TITLE + '.html';
  }

  componentDidMount() {
    const { inlineScriptId } = this.props;

    Promise.all(this.props.files.map((file) => file.compose()))
      .then((composedFiles) => this.setState({ composedFiles }));

    if (inlineScriptId) {
      const inlineLib = document.getElementById(inlineScriptId);
      if (inlineLib) {
        this.setState({
          coreString: inlineLib.textContent,
        });
      } else {
        this.setState({
          error: new Error(`Missing script element has id="${inlineScriptId}"`),
        });
      }
    } else {
      fetch(CORE_CDN_URL, { mode: 'cors' })
        .then(response => {
          if (!response.ok) {
            throw response.error ? response.error() : new Error(response.statusText);
          }
          return response.text();
        })
        .then((coreString) => this.setState({ coreString }))
        .catch((error) => this.setState({ error }));
    }
  }

  handleClone = () => {
    const raw = this.state.coreString.replace(/\<\//g, '<\\/'); // For Trust HTML

    const text = this.props.bundle({
      files: this.state.composedFiles,
      useCDN: this.state.type === 'cdn',

      // CDNの場合は無意味
      inlineScriptId: this.props.inlineScriptId,
      raw,
    });

    const file = new SourceFile({
      name: this.fileName,
      type: 'text/html',
      text,
    });

    this.props.resolve(file);
    this.props.onRequestClose();
  };

  handleChange = (event, type) => {
    this.setState({ type });
  };

  render() {
    const {
      onRequestClose,
      content,
      localization,
    } = this.props;
    const { composedFiles, coreString, error } = this.state;

    const styles = {
      button: {
        marginLeft: 8,
      },
      radio: {
        marginBottom: 12,
      },
      group: {
        padding: 24,
      },
      error: {
        color: 'red',
      },
    };

    const actions = [
      <RaisedButton primary
        label={localization.cloneDialog.save}
        disabled={!composedFiles || !coreString}
        style={styles.button}
        onTouchTap={this.handleClone}
      />,
      <FlatButton
        label={localization.cloneDialog.cancel}
        style={styles.button}
        onTouchTap={onRequestClose}
      />,
    ];

    return (
      <Dialog
        title={localization.cloneDialog.title}
        modal={false}
        open={true}
        actions={actions}
        onRequestClose={onRequestClose}
      >
        {error ? (
          <p style={styles.error}>{error}</p>
        ) : null}
        <RadioButtonGroup
          name="libType"
          valueSelected={this.state.type}
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

      </Dialog>
    );
  }
}
