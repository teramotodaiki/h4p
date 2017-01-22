import React, { PureComponent, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import Table, { TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';


import { SourceFile } from '../File/';

const getStyles = (props, context) => {

  return {
    left: {
      textAlign: 'right',
    },
  };
};

export default class AboutDialog extends PureComponent {

  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    getConfig: PropTypes.func.isRequired,
  };

  state = {
    inputCoreVersion: null,
  };

  get title() {
    return (this.props.getConfig('env').TITLE || [''])[0];
  }

  handleCoreVersionInput = (event) => {
    const inputCoreVersion = event.target.value;
    this.setState({ inputCoreVersion });
  };

  handleChangeVersion = async () => {

    const file = await SourceFile.cdn({
      files: await Promise.all( this.props.files.map((file) => file.compose()) ),
      TITLE: this.title,
      src: CORE_CDN_PREFIX + this.state.inputCoreVersion + '.js',
    });

    const url = URL.createObjectURL(file.blob);
    location.assign(url);

  };

  render() {
    const {
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
