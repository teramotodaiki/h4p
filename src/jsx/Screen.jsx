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
    isPopout: PropTypes.bool.isRequired,
    handlePopoutClose: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
  };

  state = {
    width: 300,
    height: 150,
    reboot: false
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.style !== nextProps.style) {
      this.handleResize();
    }
  }

  didPopout = false;
  prevent = null;
  start = () => {
    const { player, config, files, isPopout } = this.props;
    const model = Object.assign({}, config, { files });

    this.prevent =
      (this.prevent || Promise.resolve())
      .then(() => {
        return isPopout && this.didPopout ? new Promise((resolve, reject) => {
          // reboot
          this.setState({ reboot: true }, () => {
            this.setState({ reboot: false }, () => {
              setTimeout(() => resolve(), 300);
            });
          });
        }) : Promise.resolve();
      })
      .then(() => {
        this.didPopout = isPopout;
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
        this.handleResize();
      })
      .catch((err) => console.error(err) || err);
  };

  handleFrameLoad = (ref) => {
    if (!ref) return;
    this.iframe = ref;
  };

  handlePopoutOpen = (...args) => {
    this.parent = window.open.apply(window, args);
    this.parent.addEventListener('resize', this.handleResize);
    return this.parent;
  };

  handlePopoutClose = () => {
    if (!this.props.isPopout) return;
    this.parent.removeEventListener('resize', this.handleResize);
    if (!this.state.reboot) {
      this.props.handlePopoutClose();
    }
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
    const screenRect = this.props.isPopout ?
      { width: this.parent.innerWidth, height: this.parent.innerHeight } :
      this.iframe.parentNode.getBoundingClientRect();

    this.iframe.width = width;
    this.iframe.height = height;

    const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
    const scale = ratio(screenRect) > ratio({ width, height }) ?
      screenRect.width / width : screenRect.height / height;

    this.iframe.style.transform = `scale(${scale})`;
  };

  render() {
    const { width, height, reboot } = this.state;
    const { isPopout } = this.props;

    if (reboot) {
      return <div></div>;
    }

    const containerStyle = {
      position: 'absolute',
      width: 0,
      height: 0
    };

    const screenStyle = {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(gray, black)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };

    const frameStyle = {
      border: '0 none',
      flex: '0 0 auto'
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

    if (isPopout) {
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
        <div style={this.props.style}>
          {screen}
        </div>
      </div>
    );
  }
}
