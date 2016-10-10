import React, { Component, PropTypes } from 'react';
import Postmate from '../js/LoosePostmate';

Postmate.debug = process.env.NODE_ENV !== 'production';


import template from '../html/screen';
import screenJs from '../js/screen';

const frameURL = URL.createObjectURL(
  new Blob([template({ title: 'app', screenJs })], { type: 'text/html' })
);

export default class Screen extends Component {

  static propTypes = {
    player: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    isPopup: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired,
  };

  state = {
    width: 300,
    height: 150,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.style !== nextProps.style) {
      this.handleResize();
    }
  }

  prevent = null;
  start = (isPopup) => {
    isPopup = typeof isPopup === 'boolean' ? isPopup : this.props.isPopup;

    const { player, config, files } = this.props;
    const model = Object.assign({}, config, { files });

    const frame = isPopup ? this.openNewWindow() : this.iframe;

    this.prevent =
      (this.prevent || Promise.resolve())
      .then(() => {
        player.emit('screen.beforeunload'); // call beforeunload
        return new Postmate({
          url: frameURL,
          model,
          frame
        });
      })
      .then(child => {
        const resized = (view) => player.emit('screen.resize', view);
        child.on('load', () => child.get('size').then(resized));
        child.on('resize', resized);

        player.once('screen.beforeunload', () => child.destroy());
        player.emit('screen.load', { child });
      })
      .catch((err) => console.error(err) || err);
  };

  componentDidMount() {
    this.props.player.on('screen.resize', this.handleScreenSizeChange);
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    this.props.player.off('screen.resize', this.handleScreenSizeChange);
    window.removeEventListener('resize', this.handleResize);
  }

  handleScreenSizeChange = ({ width, height }) => {
    this.setState({ width, height });
    this.handleResize();
  };

  handleResize = () => {
    const { width, height } = this.state;
    if (!this.iframe || !this.container || this.props.isPopup) return;
    const screenRect = this.container.getBoundingClientRect();

    this.iframe.width = width;
    this.iframe.height = height;

    const translate = {
      x: (screenRect.width - width) / 2,
      y: (screenRect.height - height) / 2
    };
    const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
    const scale = ratio(screenRect) > ratio({ width, height }) ?
      screenRect.width / width : screenRect.height / height;

    this.iframe.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
  };


  openNewWindow() {
    const { width, height } = this.state;
    const popup =
      window.open(frameURL, '_blank', `
        width=${width},
        height=${height},
        resizable=yes,
        scrollbars=yes,
        status=no,
        toolbar=no,
        left=${window.screenX + 25},
        top=${window.screenY + 25}`
      );
    window.addEventListener('beforeunload', () => popup.close());
    return popup;
  }

  render() {
    const { isPopup } = this.props;

    const containerStyle = {
      position: 'absolute',
      width: 0,
      height: 0
    };

    const style = Object.assign({}, this.props.style, isPopup ? {
      display: 'none'
    } : null);

    return (
      <div style={containerStyle}>
        <div style={style}>
          <div
            ref={ref => ref && (this.container = ref)}
            className={CSS_PREFIX + 'screen'}
          >
            <iframe ref={ref => ref && (this.iframe = ref)}></iframe>
          </div>
        </div>
      </div>
    );
  }
}
