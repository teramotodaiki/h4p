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
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any,
    localization: PropTypes.object.isRequired,
  };

  state = {
    contents: this.props.content instanceof Array ? this.props.content : [this.props.content],
    results: [],
  };

  componentDidMount() {
    Promise.all(this.state.contents.map((item) => (
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({
          name: item.name,
          href: reader.result,
        });
        reader.readAsDataURL(item.blob);
      }))
    ))
    .then((results) => this.setState({ results }));
  }

  render() {
    const {
      onRequestClose,
      localization,
    } = this.props;

    const actions = [
      <Confirm primary
        onTouchTap={this.props.resolve}
        label="Confirm"
      />,
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
      {this.state.results.map((item, i) => (
        <div key={i} style={divStyle}>
          <a
            target="_blank"
            href={item.href}
            style={linkStyle}
          >
            {item.name}
          </a>
          <p>{localization.saveDialog.description(item.name)}</p>
        </div>
      ))}
      </Dialog>
    );
  }
}
