import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import Table, { TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';


import { Confirm, Abort } from './Buttons';

const getStyles = (props, context) => {

  return {
    root: {
      fontSize: 16,
    },
    left: {
      textAlign: 'right',
    },
  };
};

export default class RenameDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    changed: false,
    name: this.props.content.name,
    type: this.props.content.type,
    noBabel: this.props.content.options.noBabel,
  };

  confirm = () => {
    const { onRequestClose, resolve, content } = this.props;
    const { changed, name, type, noBabel } = this.state;

    const options = Object.assign({}, content.options, { noBabel });

    resolve(changed ? { name, type, options } : {});
    onRequestClose();
  };

  handleNameChange = (event, name) => {
    this.setState({ changed: true, name });
  };

  handleTypeChange = (event, type) => {
    this.setState({ changed: true, type });
  };

  handleNoBabelChange = (event, noBabel) => {
    this.setState({ changed: true, noBabel });
  };

  render() {
    const { onRequestClose, content } = this.props;
    const {
      changed,
      name,
      type,
      noBabel,
    } = this.state;

    const actions = [
      <Abort onTouchTap={onRequestClose} />,
      <Confirm
        label="Confirm"
        disabled={!changed}
        onTouchTap={this.confirm}
      />
    ];

    const {
      root,
      left,
      dropDown,
    } = getStyles(this.props, this.context);

    return (
      <Dialog open
        title="File Preference"
        actions={actions}
        modal={false}
        style={root}
        onRequestClose={onRequestClose}
      >
        <Table selectable={false}>
          <TableBody displayRowCheckbox={false}>
            <TableRow>
              <TableRowColumn
                style={left}
              >Name</TableRowColumn>
              <TableRowColumn>
                <TextField id="name"
                  defaultValue={name}
                  onChange={this.handleNameChange}
                />
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn
                style={left}
              >Type</TableRowColumn>
              <TableRowColumn>
              <TextField id="type"
                defaultValue={type}
                onChange={this.handleTypeChange}
              />
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={left}>
                Ingore Babel
              </TableRowColumn>
              <TableRowColumn>
                <Checkbox
                  checked={noBabel}
                  onCheck={this.handleNoBabelChange}
                />
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </Dialog>
    );
  }
}
