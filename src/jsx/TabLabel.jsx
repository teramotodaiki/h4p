import React, { Component, PropTypes } from 'react';
import { IconButton } from 'material-ui';
import PlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { darkBlack } from 'material-ui/styles/colors';


export default class TabLabel extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
  }

  handleClose = (event) => {
    const { file, handleClose } = this.props;
    handleClose(file);
  };

  render() {
    const { file, handleRun } = this.props;

    const style = {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: darkBlack
    };

    const iconButtonStyle = {
      padding: 0,
      transform: 'scale(0.65)'
    };

    const playIconStyle = Object.assign({}, iconButtonStyle, {
      marginLeft: -16,
      marginRight: -20
    });

    const closeIconStyle = Object.assign({}, iconButtonStyle, {
      marginRight: -10
    });

    const textStyle = {
      position: 'relative',
      textOverflow: 'ellipsis',
      overflowX: 'hidden'
    };

    const playIcon = file.options.isEntryPoint ? (
      <IconButton onTouchTap={handleRun} style={playIconStyle}>
        <PlayCircleOutline color={darkBlack} />
      </IconButton>
    ) : null;

    return (
      <div style={style}>
        {playIcon}
        <span style={textStyle}>{file.name}</span>
        <IconButton onTouchTap={this.handleClose} style={closeIconStyle}>
          <NavigationClose color={darkBlack} />
        </IconButton>
      </div>
    );
  }
}
