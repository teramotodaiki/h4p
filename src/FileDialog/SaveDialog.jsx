import React, { PropTypes, Component } from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Save from 'material-ui/svg-icons/content/save';


import { Confirm, Abort } from './Buttons';
import FilenameInput from './FilenameInput';

/**
 * HTML5 a要素のdownload属性が実装されていないブラウザのためのfallback
 */
export default class SaveDialog extends Component {

  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any,
    localization: PropTypes.object.isRequired,
  };

  state = {
    fallbackHref: null
  };

  componentDidMount() {
    const { content } = this.props;
    const reader = new FileReader();
    reader.onload = (e) => this.setState({ fallbackHref: reader.result });
    reader.readAsDataURL(content.blob);
  }

  render() {
    const {
      onRequestClose,
      content,
      localization,
    } = this.props;

    const actions = [
      <Abort primary
        onTouchTap={onRequestClose}
        label={localization.saveDialog.cancel}
      />,
    ];

    const divStyle = {
      textAlign: 'center',
    };

    const linkStyle = {
      fontSize: '2rem',
    };

    return (
      <Dialog
        title={localization.saveDialog.title}
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={onRequestClose}
      >
        <div style={divStyle}>
          <a
            target="_blank"
            href={this.state.fallbackHref}
            style={linkStyle}
          >
            {content.name}
          </a>
          <p>{localization.saveDialog.description(content.name)}</p>
        </div>
      </Dialog>
    );
  }
}
