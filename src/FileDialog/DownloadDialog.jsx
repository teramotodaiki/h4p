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
    const [TITLE] = this.props.getConfig('env').TITLE || [''];

    const file = new SourceFile({
      name: TITLE,
      type: 'text/html',
      text: this.props.bundle({
        files: this.state.composedFiles,
      }),
    });

    this.props.resolve(file);
    this.props.onRequestClose();
  };

  handleDownloadRaw = () => {
    const [TITLE] = this.props.getConfig('env').TITLE || [''];
    const raw = this.state.coreString.replace(/\<\//g, '<\\/'); // For Trust HTML

    const file = new SourceFile({
      name: TITLE,
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
      localization: { downloadDialog },
    } = this.props;
    const { composedFiles, coreString, error } = this.state;

    const buttonURL = (
      <RaisedButton
        label={downloadDialog.download}
        primary={true}
        disabled={!composedFiles}
        onTouchTap={this.handleDownloadCDN}
      />
    );

    const buttonRaw = (
      <RaisedButton
        label={error ? error.message : downloadDialog.download}
        primary={true}
        disabled={!composedFiles || !coreString}
        onTouchTap={this.handleDownloadRaw}
      />
    );

    return (
      <Dialog
        title={downloadDialog.title}
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
              <TableRowColumn>{downloadDialog.sourceOnly}</TableRowColumn>
              <TableRowColumn>{downloadDialog.bundleAll}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{downloadDialog.libraryType}</TableRowColumn>
              <TableRowColumn>{downloadDialog.hostingOnCdn}</TableRowColumn>
              <TableRowColumn>{downloadDialog.embedInHtml}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{downloadDialog.requirement}</TableRowColumn>
              <TableRowColumn>{downloadDialog.needInternet}</TableRowColumn>
              <TableRowColumn>{downloadDialog.maybeNothing}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{downloadDialog.fileSize}</TableRowColumn>
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
