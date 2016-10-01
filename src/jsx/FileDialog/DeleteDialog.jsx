import React, { Component, PropTypes } from 'react';
import { Dialog } from 'material-ui';
import AlertError from 'material-ui/svg-icons/alert/error';
import { redA400 } from 'material-ui/styles/colors';


import { Confirm, Abort } from './Buttons';

export default class DeleteDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any
  };

  constructor(props) {
    super(props);
  }

  handleDelete = () => {
    const { resolve, onRequestClose, content } = this.props;
    resolve(content);
    onRequestClose();
  }

  render() {
    const { onRequestClose, content } = this.props;

    const style = {
      textAlign: 'center'
    };

    const iconStyle = {
      marginRight: 10,
      marginBottom: -6,
    };

    const actions = [
      <Abort onTouchTap={onRequestClose} />,
      <Confirm label="Delete" onTouchTap={this.handleDelete} />,
    ];

    return (
      <Dialog
        title={<h3>Do you really want to delete <b>{content && content.name}</b>?</h3>}
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={onRequestClose}
        bodyStyle={style}
      >
        <AlertError color={redA400} style={iconStyle} />
        This operation can not be undone.
      </Dialog>
    );
  }
}
