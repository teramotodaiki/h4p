import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import Table, { TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';


import { compose } from '../js/files';
import download from '../html/download';

const getStyles = (props, context) => {

  return {
    left: {
      textAlign: 'right',
    },
  };
};

export default class AboutDialog extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    env: PropTypes.object.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  state = {
    inputCoreVersion: null
  };

  handleCoreVersionInput = (event) => {
    const inputCoreVersion = event.target.value;
    this.setState({ inputCoreVersion });
  };

  handleChangeVersion = () => {
    const { inputCoreVersion } = this.state;
    const [TITLE] = this.props.env.TITLE || [''];

    Promise.all(this.props.files.map(compose))
    .then(files => {
      const html = download({
        files,
        useCDN: true,
        CORE_CDN_URL: `${CORE_CDN_PREFIX}${inputCoreVersion}.js`,
        EXPORT_VAR_NAME,
        CSS_PREFIX,
        TITLE,
      });

      const url = URL.createObjectURL(
        new Blob([html], { type: 'text/html' })
      );
      location.assign(url);
    });
  };
  
  render() {
    const {
      updateEnv,
      onRequestClose,
      localization: { aboutDialog },
    } = this.props;
    const {
      inputCoreVersion,
    } = this.state;

    const { left } = getStyles(this.props);

    return (
      <div>
        <Dialog open
          title={aboutDialog.title}
          modal={false}
          onRequestClose={onRequestClose}
        >
          <Table selectable={false}>
            <TableBody displayRowCheckbox={false}>
              <TableRow>
                <TableRowColumn style={left}>
                {aboutDialog.coreVersion}
                </TableRowColumn>
                <TableRowColumn>
                {CORE_VERSION}
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn style={left}>
                {aboutDialog.changeVersion}
                </TableRowColumn>
                <TableRowColumn>
                  <TextField
                    id="ver"
                    defaultValue={CORE_VERSION}
                    onChange={this.handleCoreVersionInput}
                  />
                  <FlatButton primary
                    label={aboutDialog.change}
                    disabled={!inputCoreVersion}
                    onTouchTap={this.handleChangeVersion}
                  />
                </TableRowColumn>
              </TableRow>
            </TableBody>
          </Table>
        </Dialog>
      </div>
    );
  }
}
