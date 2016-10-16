import React, { Component, PropTypes } from 'react';
import { transparent, faintBlack, darkBlack } from 'material-ui/styles/colors';


export default class Preview extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
  };

  state = {
    scale: 1,
  };

  componentDidMount() {
    const { type, blobURL } = this.props.file;
    if (type.indexOf('image/') === 0) {
      const image = new Image();
      image.onload = () => {
        const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
        const screenRect = this.container.getBoundingClientRect();
        const scale = ratio(screenRect) > ratio(image) ?
          screenRect.width / image.width : screenRect.height / image.height;
        this.setState({ scale: scale * 0.9 });
      };
      image.src = blobURL;
    }
  }

  render() {
    const { name, type, blob, blobURL } = this.props.file;

    const containerStyle = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      overflow: 'hidden',
      background: `linear-gradient(${transparent}, ${darkBlack})`,
      width: '100%',
      height: '100%',
    };

    const content = (
      <img src={blobURL} alt={name} style={{ transform: `scale(${this.state.scale})` }} />
    );

    return (
      <div style={containerStyle} ref={ref => ref && (this.container = ref)}>
      {content}
      </div>
    );
  }
}
