import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Table, { TableBody, TableRow, TableRowColumn } from 'material-ui/Table';


import { SourceFile } from '../File/';

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

  handleDownloadCDN = () => {
    const file = new SourceFile({
      name: this.fileName,
      type: 'text/html',
      text: this.props.bundle({
        files: this.state.composedFiles,
      }),
    });

    this.props.resolve(file);
    this.props.onRequestClose();
  };

  handleDownloadRaw = () => {
    const raw = this.state.coreString.replace(/\<\//g, '<\\/'); // For Trust HTML

    const file = new SourceFile({
      name: this.fileName,
      type: 'text/html',
      text: this.props.bundle({
        files: this.state.composedFiles,
        useCDN: false,
        inlineScriptId: this.props.inlineScriptId,
        raw,
      }),
    });

    this.props.resolve(file);
    this.props.onRequestClose();
  };

  render() {
    const {
      onRequestClose,
      content,
      localization,
    } = this.props;
    const { composedFiles, coreString, error } = this.state;

    const buttonURL = (
      <RaisedButton
        label={localization.cloneDialog.clone}
        primary={true}
        disabled={!composedFiles}
        onTouchTap={this.handleDownloadCDN}
      />
    );

    const buttonRaw = (
      <RaisedButton
        label={error ? error.message : localization.cloneDialog.clone}
        primary={true}
        disabled={!composedFiles || !coreString}
        onTouchTap={this.handleDownloadRaw}
      />
    );

    return (
      <Dialog
        title={localization.cloneDialog.title}
        modal={false}
        open={true}
        onRequestClose={onRequestClose}
      >
        <Table>
          <TableBody
            displayRowCheckbox={false}
          >
            <TableRow>
              <TableRowColumn></TableRowColumn>
              <TableRowColumn>{localization.cloneDialog.sourceOnly}</TableRowColumn>
              <TableRowColumn>{localization.cloneDialog.bundleAll}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{localization.cloneDialog.libraryType}</TableRowColumn>
              <TableRowColumn>{localization.cloneDialog.hostingOnCdn}</TableRowColumn>
              <TableRowColumn>{localization.cloneDialog.embedInHtml}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{localization.cloneDialog.requirement}</TableRowColumn>
              <TableRowColumn>{localization.cloneDialog.needInternet}</TableRowColumn>
              <TableRowColumn>{localization.cloneDialog.maybeNothing}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{localization.cloneDialog.fileSize}</TableRowColumn>
              <TableRowColumn>1-10KB</TableRowColumn>
              <TableRowColumn>1MB+</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn></TableRowColumn>
              <TableRowColumn>{buttonURL}</TableRowColumn>
              <TableRowColumn>
                {buttonRaw}
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </Dialog>
    );
  }
}
