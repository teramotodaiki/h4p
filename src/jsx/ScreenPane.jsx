import React, { Component, PropTypes } from 'react';
import Popout from '../lib/ReactPopout';

import Postmate from '../js/LoosePostmate';

Postmate.debug = process.env.NODE_ENV !== 'production';


import template from '../html/screen';
import screenJs from '../js/screen';
import popoutTemplate from '../html/popout';
import Screen from './Screen';

const frameURL = URL.createObjectURL(
  new Blob([template({ title: 'app', screenJs })], { type: 'text/html' })
);

const popoutURL = URL.createObjectURL(
  new Blob([popoutTemplate()], { type: 'text/html' })
);

export default class ScreenPane extends Component {

  static propTypes = {
    player: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    reboot: PropTypes.bool.isRequired,
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

  componentDidUpdate(prevProps, prevStates) {
    if (prevProps.reboot && !this.props.reboot) {
      if (!this.props.isPopout) {
        this.start();
      } else {
        // react-popoutがpopoutWindowにDOMをrenderした後でstartする必要がある
        // renderを補足するのは難しい&updateの度に何度もrenderされる=>delayを入れる
        setTimeout(() => this.start(), 300);
      }
    }
  }

  get iframe() {
    return this.props.isPopout ? this.popoutFrame : this.inlineFrame;
  }

  prevent = null;
  start () {
    const { player, config, files } = this.props;
    const model = Object.assign({}, config, { files, debug: true });

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
        if (!child) {
          return Promise.reject();
        }
        const resized = (view) => player.emit('screen.resize', view);
        child.on('load', () => child.get('size').then(resized));
        child.on('resize', resized);

        player.once('screen.beforeunload', () => child.destroy());
        player.emit('screen.load', { child });
        this.handleResize();
      })
      .catch((err) => console.error(err) || err);
  }

  handlePopoutOpen = (...args) => {
    this.parent = window.open.apply(window, args);
    if (this.parent) {
      this.parent.addEventListener('resize', this.handleResize);
    }
    return this.parent;
  };

  handlePopoutClose = () => {
    if (!this.props.isPopout) return;
    if (this.parent) {
      this.parent.removeEventListener('resize', this.handleResize);
    }
    if (!this.props.reboot) {
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
    this.setState({ width, height }, this.handleResize);
  };

  handleResize = () => {
    const { width, height } = this.state;
    const { isPopout } = this.props;
    if (!this.iframe || !this.iframe.parentNode || (isPopout && this.parent && this.parent.closed)) {
      return;
    }
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
    const { width, height } = this.state;
    const { isPopout, reboot } = this.props;

    const containerStyle = {
      position: 'absolute',
      width: 0,
      height: 0
    };

    const popoutOptions = {
      width: width,
      height: height,
      left: window.screenX + 25,
      top: window.screenY + 25
    };

    const popout = isPopout && !reboot ? (
      <Popout
        url={popoutURL}
        title='app'
        options={popoutOptions}
        window={{
          open: this.handlePopoutOpen,
          addEventListener: window.addEventListener.bind(window),
          removeEventListener: window.removeEventListener.bind(window),
        }}
        onClosing={this.handlePopoutClose}
      >
        <Screen display frameRef={(ref) => ref && (this.popoutFrame = ref)} />
      </Popout>
    ) : null;

    return (
      <div style={containerStyle}>
        <div style={this.props.style}>
          {popout}
          <Screen display={!isPopout} frameRef={(ref) => ref && (this.inlineFrame = ref)} />
        </div>
      </div>
    );
  }
}
