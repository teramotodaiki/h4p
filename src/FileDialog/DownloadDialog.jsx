import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Table, { TableBody, TableRow, TableRowColumn } from 'material-ui/Table';


import { SourceFile } from '../File/';

export default class DownloadDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    bundle: PropTypes.func.isRequired,
    inlineScriptId: PropTypes.string,
  };

  state = {
    bundleWithURL: null,
    bundleWithRaw: null,
    errorInFetch: null
  };

  componentDidMount() {
    const { inlineScriptId } = this.props;

    this.bundle()
      .then((bundleWithURL) => this.setState({ bundleWithURL }));

    const lib = Promise.resolve()
      .then(() => {
        if (inlineScriptId) {
          const inlineLib = document.getElementById(inlineScriptId);
          if (inlineLib) {
            return inlineLib.textContent;
          }
          throw `Missing script element has id="${inlineScriptId}"`;
        }
        return fetch(CORE_CDN_URL, { mode: 'cors' })
          .then(response => {
            if (!response.ok) {
              throw response.error ? response.error() : new Error(response.statusText);
            }
            return response.text();
          });
      })
      .then(lib => {
        const raw = lib.replace(/\<\//g, '<\\/'); // For Trust HTML
        const inlineScriptId = `FEELES_CORE_${CORE_VERSION}`;
        this.bundle({ useCDN: false, raw, inlineScriptId })
          .then((bundleWithRaw) => this.setState({ bundleWithRaw }));
      })
      .catch(err => {
        console.error(err);
        this.setState({ errorInFetch: err });
      });
  }

  bundle(config) {
    const { getConfig } = this.props;
    const [TITLE] = getConfig('env').TITLE || [''];

    return this.props.bundle(config)
      .then((text) => (
        new SourceFile({
          name: TITLE,
          type: 'text/html',
          text,
        })
      ));
  }

  handleDownload = (content) => {
    const { resolve, onRequestClose } = this.props;

    resolve(content);
    onRequestClose();
  }

  render() {
    const {
      onRequestClose,
      content,
      localization: { downloadDialog },
    } = this.props;
    const { bundleWithURL, bundleWithRaw, errorInFetch } = this.state;

    const buttonURL = (
      <RaisedButton
        label={downloadDialog.download}
        primary={true}
        disabled={!bundleWithURL}
        onTouchTap={() => this.handleDownload(bundleWithURL)}
      />
    );

    const buttonRaw = (
      <RaisedButton
        label={errorInFetch ? errorInFetch.message : downloadDialog.download}
        primary={true}
        disabled={!bundleWithRaw}
        onTouchTap={() => this.handleDownload(bundleWithRaw)}
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
