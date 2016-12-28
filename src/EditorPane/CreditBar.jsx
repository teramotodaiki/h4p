import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';


import { SignDialog } from '../FileDialog/';


const getStyle = (props, context) => {
  const {
    palette,
  } = context.muiTheme;

  return {
    root: Object.assign({
      fontSize: '.5rem',
      padding: 4,
      backgroundColor: palette.canvasColor,
    }, props.style),
    creditLabel: {
      paddingLeft: '1rem',
    },
    sign: {
      height: '1rem',
      lineHeight: '1rem',
    },
    signLabel: {
      fontSize: '.5rem',
      padding: '0 8px',
      textTransform: 'none',
    },
  };
};

export default class CreditBar extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
  };

  static defaultProps = {
    style: {},
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  handleSignDialog = () => {
    const { file } = this.props;
    this.props.openFileDialog(SignDialog, { content: file })
      .then((sign) => this.props.putFile(file, file.set({ sign })));
  };


  render() {
    const {
      file,
      localization,
    } = this.props;
    const {
      root,
      creditLabel,
      sign,
      signLabel,
    } = getStyle(this.props, this.context);

    return (
      <div style={root}>
      {file.credit && file.credit !== file.sign ? (
        file.credit.url ? (
          <a href={file.credit.url} target="_blank" style={creditLabel}>{file.credit.label}</a>
        ) : (
          <span style={creditLabel}>{file.credit.label}</span>
        )
      ) : (
        <FlatButton
          secondary={!file.sign}
          label={file.sign ? file.sign.label : localization.credit.writeAuthorName}
          style={sign}
          labelStyle={signLabel}
          onTouchTap={this.handleSignDialog}
        />
      )}
      </div>
    );
  }
}
