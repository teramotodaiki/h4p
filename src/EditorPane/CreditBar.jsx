import React, { PureComponent, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';


import { SignDialog } from '../FileDialog/';


const getStyle = (props, context) => {
  const {
    palette,
  } = context.muiTheme;

  return {
    root: Object.assign({
      display: 'flex',
      justifyContent: 'space-between',
      padding: 4,
      borderTop: `1px solid ${palette.primary1Color}`,
      backgroundColor: palette.canvasColor,
    }, props.style),
    smallButton: {
      height: '1rem',
      lineHeight: '1rem',
    },
    smallLabel: {
      fontSize: '.5rem',
      padding: '0 8px',
      textTransform: 'none',
    },
  };
};

export default class CreditBar extends PureComponent {

  static propTypes = {
    file: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
  };

  static defaultProps = {
    style: {},
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    open: false,
    anchorEl: null,
  };

  handleSignDialog = () => {
    const { file } = this.props;
    const dialogProps = {
      content: file,
      getFiles: this.props.getFiles,
    };
    this.props.openFileDialog(SignDialog, dialogProps)
      .then((nextFile) => this.props.putFile(file, nextFile));
  };

  handleShowCredits = (event) => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  renderCredit(credit, styles) {
    return credit.url ? (
      <a
        href={credit.url}
        target="_blank"
        style={styles.smallLabel}
      >{credit.label}</a>
    ) : (
      <span style={styles.smallLabel}>{credit.label}</span>
    );
  }

  render() {
    const {
      file,
      localization,
    } = this.props;
    const styles = getStyle(this.props, this.context);

    return (
      <div style={styles.root}>
      {file.credit && file.credit !== file.sign ? (
        this.renderCredit(file.credit, styles)
      ) : (
        <FlatButton
          secondary={!file.sign}
          label={file.sign ? file.sign.label : localization.credit.writeAuthorName}
          style={styles.smallButton}
          labelStyle={styles.smallLabel}
          onTouchTap={this.handleSignDialog}
        />
      )}
      {file.credits.length > 0 ? (
        <FlatButton
          label={localization.credit.credits}
          style={styles.smallButton}
          labelStyle={styles.smallLabel}
          onTouchTap={this.handleShowCredits}
        />
      ) : null}
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
        >
        {file.credits.map((credit) => (
          <div key={credit.hash}>{this.renderCredit(credit, styles)}</div>
        ))}
        </Popover>
      </div>
    );
  }
}
