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
    const params = {
      files: this.state.composedFiles,
    };
    switch (this.state.type) {
      case 'embed':
        params.body = `
  <script type="text/javascript" id="${this.props.inlineScriptId}">
  ${this.state.coreString.replace(/\<\//g, '<\\/')}
  </script>
  <script type="text/javascript">
  ${EXPORT_VAR_NAME}({ inlineScriptId: "${this.props.inlineScriptId}" });
  </script>
`;
        break;
      case 'cdn':
        params.head = `
  <script async src="${CORE_CDN_URL}" onload="${EXPORT_VAR_NAME}()"></script>
`;
        break;
    }

    const file = new SourceFile({
      name: this.fileName,
      type: 'text/html',
      text: this.props.bundle(params),
    });

    this.props.resolve(file);
    this.props.onRequestClose();
  };

  handleCloneLibrary = () => {
  };

  handleCloneAll = () => {
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
    const { type, composedFiles, coreString, error } = this.state;

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
      error: {
        color: 'red',
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
        {error ? (
          <p style={styles.error}>{error}</p>
        ) : null}
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
