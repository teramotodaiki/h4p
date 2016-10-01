import React, { Component, PropTypes } from 'react';
import { Dialog, FlatButton, RaisedButton } from 'material-ui';

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
    const filename = content && content.filename;

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={onRequestClose}
      />,
      <RaisedButton
        label="Delete"
        primary={true}
        onTouchTap={this.handleDelete}
      />
    ];

    return (
      <Dialog
        title={`Do you really want to delete ${filename} ?`}
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={onRequestClose}
      >
        <div>This operation can not be undone.</div>
      </Dialog>
    );
  }
}
