import React, { Component, PropTypes } from 'react';
import { fullWhite, fullBlack } from 'material-ui/styles/colors';


import CreditBar from './CreditBar';


const getStyles = (props, context, state) => {
  const { prepareStyles } = context.muiTheme;
  const { scale } = state;

  return {
    root: prepareStyles({
      position: 'absolute',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      overflow: 'hidden',
      background: `linear-gradient(${fullWhite}, ${fullBlack})`,
      width: '100%',
      height: '100%',
    }),
    img: prepareStyles({
      transform: `scale(${scale})`,
    }),
  };
};

export default class Preview extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    scale: 1,
  };

  componentDidMount() {
    const { file } = this.props;
    if (file.is('image')) {
      const image = new Image();
      image.onload = () => {
        const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
        const screenRect = this.container.getBoundingClientRect();
        const scale = ratio(screenRect) > ratio(image) ?
          screenRect.width / image.width : screenRect.height / image.height;
        this.setState({ scale: scale * 0.9 });
      };
      image.src = file.blobURL;
    }
  }

  render() {
    const { file } = this.props;

    const {
      root,
      img,
    } = getStyles(this.props, this.context, this.state);

    const content = file.is('image') ? (
      <img src={file.blobURL} alt={file.name} style={img} />
    ) : file.is('audio') ? (
      <audio src={file.blobURL} controls />
    ) : null;

    const creditStyle = {
      position: 'absolute',
      bottom: 0,
      width: '100%',
    };

    return (
      <div style={root} ref={ref => ref && (this.container = ref)}>
      {content}
      <CreditBar
        file={file}
        openFileDialog={this.props.openFileDialog}
        putFile={this.props.putFile}
        localization={this.props.localization}
        getFiles={this.props.getFiles}
        style={creditStyle}
      />
      </div>
    );
  }
}
