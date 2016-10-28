import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Table, { TableBody, TableRow, TableRowColumn } from 'material-ui/Table';


import { compose } from '../js/files';
import download from '../html/download';
import { exportEnv } from '../js/env';

export default class DownloadDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    env: PropTypes.array.isRequired,
    palette: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
  };

  state = {
    bundleWithURL: null,
    bundleWithRaw: null,
    errorInFetch: null
  };

  componentDidMount() {
    Promise.all(this.props.files.map(compose))
    .then(files => {
      const exports = JSON.stringify({
        env: exportEnv(this.props.env),
        palette: this.props.palette
      });
      const bundleWithURL = this.bundle({ files, exports, useCDN: true });
      this.setState({ bundleWithURL });

      return [files, exports];
    })
    .then(([files, exports]) => fetch(CORE_CDN_URL, { mode: 'cors' })
      .then(response => {
        if (!response.ok) {
          throw response.error ? response.error() : new Error(response.statusText);
        }
        return response.text();
      })
      .then(lib => {
        const raw = encodeURIComponent(lib);
        const bundleWithRaw = this.bundle({ files, exports, raw });
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
