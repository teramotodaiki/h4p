import React, { Component, PropTypes } from 'react';
import Postmate from '../js/LoosePostmate';

Postmate.debug = process.env.NODE_ENV !== 'production';


import template from '../html/screen';
import screenJs from '../js/screen';

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
    const { width, height } = this.state;
    const model = Object.assign({}, config, { files });

    const title = 'h4p';
    const html = template({ title, screenJs });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const frame = isPopup ?
      window.open(url, '_blank', `width=${width},height=${height}`) :
      this.iframe;

    this.prevent =
      (this.prevent || Promise.resolve())
      .then(() => {
        player.emit('screen.beforeunload'); // call beforeunload
        return new Postmate({
          url,
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
    if (!this.iframe || !this.container) return;
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
