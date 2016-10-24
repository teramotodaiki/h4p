import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Table, { TableBody, TableRow, TableRowColumn } from 'material-ui/Table';


import { compose } from '../../js/files';
import download from '../../html/download';
import { exportEnv } from '../../js/env';

export default class DownloadDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    env: PropTypes.array.isRequired
  };

  state = {
    bundleWithURL: null,
    bundleWithRaw: null,
    errorInFetch: null
  };

  componentDidMount() {
    Promise.all(this.props.files.map(compose))
    .then(files => {
      const env = exportEnv(this.props.env);
      const bundleWithURL = this.bundle({ files, env, useCDN: true });
      this.setState({ bundleWithURL });

      return [files, env];
    })
    .then(([files, env]) => fetch(CORE_CDN_URL, { mode: 'cors' })
      .then(response => {
        if (!response.ok) {
          throw response.error ? response.error() : new Error(response.statusText);
        }
        return response.text();
      })
      .then(lib => {
        const raw = encodeURIComponent(lib);
        const bundleWithRaw = this.bundle({ files, env, raw });
        this.setState({ bundleWithRaw });
      })
    )
    .catch(err => {
      console.error(err);
      this.setState({ errorInFetch: err });
    });
  }

  bundle(config) {
    const props = Object.assign({}, config, {
      EXPORT_VAR_NAME,
      CSS_PREFIX,
      CORE_CDN_URL,
    });
    return {
      name: 'download',
      type: 'text/html',
      isText: true,
      text: download(props)
    };
  }

  handleDownload = (content) => {
    const { resolve, onRequestClose } = this.props;

    resolve(content);
    onRequestClose();
  }

  render() {
    const { onRequestClose, content } = this.props;
    const { bundleWithURL, bundleWithRaw, errorInFetch } = this.state;

    const buttonURL = (
      <RaisedButton
        label="Download"
        primary={true}
        disabled={!bundleWithURL}
        onTouchTap={() => this.handleDownload(bundleWithURL)}
      />
    );

    const buttonRaw = (
      <RaisedButton
        label={errorInFetch ? errorInFetch.message : "Download"}
        primary={true}
        disabled={!bundleWithRaw}
        onTouchTap={() => this.handleDownload(bundleWithRaw)}
      />
    );

    return (
      <Dialog
        title="Chose download type"
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
              <TableRowColumn>Source Only</TableRowColumn>
              <TableRowColumn>Bundle ALL</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>Library type</TableRowColumn>
              <TableRowColumn>Hosting in CDN</TableRowColumn>
              <TableRowColumn>Embed in HTML</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>Requirement in downloading</TableRowColumn>
              <TableRowColumn>Nothing</TableRowColumn>
              <TableRowColumn>Need internet</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>Requirement in playing</TableRowColumn>
              <TableRowColumn>Need internet</TableRowColumn>
              <TableRowColumn>Maybe Nothing</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>File size</TableRowColumn>
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
