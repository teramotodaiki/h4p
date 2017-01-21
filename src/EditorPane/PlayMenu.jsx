import React, { PureComponent, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import AVPlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';


export default class PlayMenu extends PureComponent {

  static propTypes = {
    getFiles: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    localization: PropTypes.object.isRequired,
  };

  handlePlay = () => {
    this.props.setLocation();
  };

  render() {
    const {
      localization,
    } = this.props;

    const styles = {
      root: {
        padding: 0,
        height: '1.6rem',
        lineHeight: '1.6rem',
      },
      label: {
        fontSize: '.5rem',
      },
    };

    return (
      <FlatButton
        label={localization.editor.play}
        style={styles.root}
        labelStyle={styles.label}
        icon={<AVPlayCircleOutline />}
        onTouchTap={this.handlePlay}
      />
    );
  }
}
