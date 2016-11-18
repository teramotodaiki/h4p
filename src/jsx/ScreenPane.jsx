import React, { Component, PropTypes } from 'react';
import Popout from './ReactPopout';
import { transform } from 'babel-standalone';
import IconButton from 'material-ui/IconButton';
import NavigationRefreh from 'material-ui/svg-icons/navigation/refresh';


import composeEnv from '../js/composeEnv';
import template from '../html/screen';
import fallbackTemplate from '../html/dangerScreen';
import screenJs from '../../lib/screen';
import popoutTemplate from '../html/popout';
import Screen, { SrcDocEnabled } from './Screen';

const ConnectionTimeout = 1000;
const popoutURL = URL.createObjectURL(
  new Blob([popoutTemplate()], { type: 'text/html' })
);

const frameLoader = (() => {
  if (SrcDocEnabled) {
    const screen = template({ title: 'app', screenJs });
    return (frame, callback) => {
      frame.onload = () => callback(frame);
      frame.srcdoc = screen;
    };
  } else {
    const fallback = fallbackTemplate({ title: 'app' });
    return (frame, callback) =>  {
      frame.onload = () => {
        frame.contentWindow.postMessage(screenJs, '*');
        callback(frame, 1);
      };
      frame.src = `javascript: '${fallback}'`;
    };
  }
})();

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
    config: PropTypes.object.isRequired,
    primaryWidth: PropTypes.number.isRequired,
    secondaryHeight: PropTypes.number.isRequired,
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    reboot: PropTypes.bool.isRequired,
    env: PropTypes.object.isRequired,
    handlePopoutClose: PropTypes.func.isRequired,
    portRef: PropTypes.func.isRequired,
    babelrc: PropTypes.object.isRequired,
    handleRun: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    width: 300,
    height: 150,
  };

  popoutOptions = {
    width: 300,
    height: 150,  // means innerHeight of browser expecting Safari.
    left: 50,
    top: 50,
  };

  popoutClosed = false;

  componentDidUpdate(prevProps, prevStates) {
    if (prevProps.reboot && !this.props.reboot) {
      if (this.props.isPopout || this.popoutClosed) {
        // react-popoutがpopoutWindowにDOMをrenderした後でstartする必要がある
        // renderを補足するのは難しい&updateの度に何度もrenderされる=>delayを入れる
        setTimeout(() => this.start(), 300);
        this.popoutClosed = false;
      } else {
        this.start();
      }
    }
    if (prevProps.isPopout && !this.props.isPopout) {
      this.popoutClosed = true; // Use delay
    }

    if (
      this.props.primaryWidth !== prevProps.primaryWidth ||
      this.props.secondaryHeight !== prevProps.secondaryHeight
    ) {
      this.handleResize();
    }
  }

  get iframe() {
    return this.props.isPopout ? this.popoutFrame : this.inlineFrame;
  }

  prevent = null;
  start () {
    const { portRef, babelrc } = this.props;
    const files = this.props.files
      .filter((file) => file.moduleName)
      .map((file) => {
        if (file.isText &&
            file.type === 'text/javascript' &&
            !file.options.noBabel)
        {
          const text = transform(file.text, babelrc).code;
          return Object.assign({}, file, { text });
        }
        return file;
      });

    const env = composeEnv(this.props.env);

    this.prevent =
      (this.prevent || Promise.resolve())
      .then(() => new Promise((resolve, reject) => {
        setTimeout(reject, ConnectionTimeout);
        frameLoader(this.iframe, resolve);
      }))
      .then(frame => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (e) => {
          switch (e.data.query) {
            case 'resize':
              const { width, height } = e.data.value;
              this.setState({ width, height }, this.handleResize);
              break;
          }
        };
        portRef(channel.port1);

        frame.contentWindow.postMessage({
          files, env,
        }, '*', [channel.port2]);
      })
      .catch((err) => console.error(err) || err);
  }

  handlePopoutOpen = (...args) => {
    this.parent = window.open.apply(window, args);
    if (this.parent) {
      this.parent.addEventListener('resize', this.handleResize);
      this.parent.addEventListener('load', () => {

        const out = this.popoutOptions.height !== this.parent.innerHeight;
        this.parent.addEventListener('resize', () => {
          this.popoutOptions = Object.assign({}, this.popoutOptions, {
            width: this.parent.innerWidth,
            height: out ? this.parent.outerHeight : this.parent.innerHeight,
          });
        });

        const popoutMove = setInterval(() => {
          if (this.parent.screenX === this.popoutOptions.left &&
              this.parent.screenY === this.popoutOptions.top) {
            return;
          }
          this.popoutOptions = Object.assign({}, this.popoutOptions, {
            left: this.parent.screenX,
            top: this.parent.screenY,
          });
        }, 100);

        this.parent.addEventListener('beforeunload', () => {
          clearInterval(popoutMove);
        });
      });
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
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    const { width, height } = this.state;
    const { isPopout } = this.props;
    if (!this.iframe || !this.iframe.parentNode || (isPopout && this.parent && this.parent.closed)) {
      return;
    }
    const screenRect = this.props.isPopout ?
      { width: this.parent.innerWidth, height: this.parent.innerHeight } :
      this.iframe.parentNode.getBoundingClientRect();

    this.iframe.width = width + 'px';
    this.iframe.height = height + 'px';

    const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
    const scale = ratio(screenRect) > ratio({ width, height }) ?
      screenRect.width / width : screenRect.height / height;

    this.iframe.style.transform = `scale(${scale})`;
  };

  render() {
    const { width, height } = this.state;
    const { isPopout, reboot, handleRun } = this.props;

    const { root, container } = getStyle(this.props, this.context);
    const { prepareStyles } = this.context.muiTheme;

    const popout = isPopout && !reboot ? (
      <Popout
        url={popoutURL}
        title='app'
        options={this.popoutOptions}
        window={{
          open: this.handlePopoutOpen,
          addEventListener: window.addEventListener.bind(window),
          removeEventListener: window.removeEventListener.bind(window),
        }}
        onClosing={this.handlePopoutClose}
      >
        <Screen display
          frameRef={(ref) => ref && (this.popoutFrame = ref)}
          handleRun={handleRun}
          reboot={reboot}
        />
      </Popout>
    ) : null;

    return (
      <div style={prepareStyles(root)}>
        <div style={prepareStyles(container)}>
          {popout}
          <Screen animation
            display={!isPopout}
            frameRef={(ref) => ref && (this.inlineFrame = ref)}
            handleRun={handleRun}
            reboot={reboot}
          />
        </div>
      </div>
    );
  }
}
