import React, { Component, PropTypes } from 'react';
import Popout from 'react-popout';
import Postmate from '../js/LoosePostmate';

Postmate.debug = process.env.NODE_ENV !== 'production';


import template from '../html/screen';
import screenJs from '../js/screen';
import popout from '../html/popout';

const frameURL = URL.createObjectURL(
  new Blob([template({ title: 'app', screenJs })], { type: 'text/html' })
);

const popoutURL = URL.createObjectURL(
  new Blob([popout()], { type: 'text/html' })
);

export default class Screen extends Component {

  static propTypes = {
    player: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    isPopup: PropTypes.bool.isRequired,
    handlePopoutClose: PropTypes.func.isRequired,
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
  start = () => {
    const { player, config, files } = this.props;
    const model = Object.assign({}, config, { files });

    this.prevent =
      (this.prevent || Promise.resolve())
      .then(() => {
        player.emit('screen.beforeunload'); // call beforeunload
        return new Postmate({
          url: frameURL,
          model,
          frame: this.iframe
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

  handleFrameLoad = (ref) => {
    if (!ref) return;
    this.iframe = ref;
    this.start();
  };

  handlePopoutOpen = (...args) => {
    this.parent = window.open.apply(window, args);
    this.parent.addEventListener('resize', this.handleResize);
    return this.parent;
  };

  handlePopoutClose = () => {
    if (!this.props.isPopup) return;
    this.parent.removeEventListener('resize', this.handleResize);
    this.props.handlePopoutClose();
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
    if (!this.iframe || !this.iframe.parentNode) return;
    const screenRect = this.props.isPopup ?
      { width: this.parent.innerWidth, height: this.parent.innerHeight } :
      this.iframe.parentNode.getBoundingClientRect();

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
    const { width, height } = this.state;
    const { isPopup } = this.props;

    const containerStyle = {
      position: 'absolute',
      width: 0,
      height: 0
    };

    const style = Object.assign({}, this.props.style, isPopup ? {
      display: 'none'
    } : null);

    const screenStyle = {
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(gray, black)',
    };

    const frameStyle = {
      position: 'absolute',
      border: '0 none',
      margin: 0,
      padding: 0,
      top: 0,
      left: 0,
    };

    const popoutOptions = {
      width: width,
      height: height,
      left: window.screenX + 25,
      top: window.screenY + 25
    };

    const screen = (
      <div style={screenStyle}>
        <iframe
          sandbox="allow-scripts allow-same-origin"
          style={frameStyle}
          ref={this.handleFrameLoad}
        ></iframe>
      </div>
    );

    if (isPopup) {
      const fakeOwner = {
        open: this.handlePopoutOpen,
        addEventListener: window.addEventListener.bind(window),
        removeEventListener: window.removeEventListener.bind(window),
      };
      return (
        <Popout
          url={popoutURL}
          title='app'
          options={popoutOptions}
          window={fakeOwner}
          onClosing={this.handlePopoutClose}
        >
          {screen}
        </Popout>
      );
    }

    return (
      <div style={containerStyle}>
        <div style={style}>
          {screen}
        </div>
      </div>
    );
  }
}
