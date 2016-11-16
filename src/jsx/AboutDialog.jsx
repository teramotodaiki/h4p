import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import Table, { TableBody, TableRow, TableRowColumn } from 'material-ui/Table';


const getStyles = (props, context) => {

  return {
    left: {
      textAlign: 'right',
    },
  };
};

export default class AboutDialog extends Component {

  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  render() {
    const {
      updateEnv,
      onRequestClose,
      localization: { aboutDialog },
    } = this.props;

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
            </TableBody>
          </Table>
        </Dialog>
      </div>
    );
  }
}
