import React, { Component, PropTypes } from 'react';
import Popout from '../lib/ReactPopout';

import Postmate from '../js/LoosePostmate';

Postmate.debug = process.env.NODE_ENV !== 'production';


import { composeEnv } from '../js/env';
import template from '../html/screen';
import screenJs from '../js/screen';
import popoutTemplate from '../html/popout';
import Screen from './Screen';

const ConnectionTimeout = 1000;
const frameURL = URL.createObjectURL(
  new Blob([template({ title: 'app', screenJs })], { type: 'text/html' })
);
const popoutURL = URL.createObjectURL(
  new Blob([popoutTemplate()], { type: 'text/html' })
);

const getStyle = (props, context) => {
  const { config, primaryWidth, secondaryHeight } = props;

  return {
    root: {
      position: 'absolute',
      width: 0,
      height: 0,
      top: 0,
      left: 0,
    },
    container: {
      boxSizing: 'border-box',
      width: config.width,
      height: config.height,
      paddingRight: primaryWidth,
      paddingBottom: secondaryHeight,
    },
  };
};

export default class ScreenPane extends Component {

  static propTypes = {
    player: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    primaryWidth: PropTypes.number.isRequired,
    secondaryHeight: PropTypes.number.isRequired,
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    reboot: PropTypes.bool.isRequired,
    env: PropTypes.array.isRequired,
    handlePopoutClose: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
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
    const env = composeEnv(this.props.env);
    const model = Object.assign({}, config, { files, env });

    this.prevent =
      (this.prevent || Promise.resolve())
      .then(() => new Promise((resolve, reject) => {
        player.emit('screen.beforeunload'); // call beforeunload

        new Postmate({
          url: frameURL,
          model,
          frame: this.iframe
        })
        .then(resolve);

        setTimeout(reject, ConnectionTimeout);
      }))
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

    const { root, container } = getStyle(this.props, this.context);
    const { prepareStyles } = this.context.muiTheme;

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
      <div style={prepareStyles(root)}>
        <div style={prepareStyles(container)}>
          {popout}
          <Screen display={!isPopout} frameRef={(ref) => ref && (this.inlineFrame = ref)} />
        </div>
      </div>
    );
  }
}
