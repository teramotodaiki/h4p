import React, { Component, PropTypes } from 'react';
import Popout from '../jsx/ReactPopout';
import IconButton from 'material-ui/IconButton';
import LinearProgress from 'material-ui/LinearProgress';
import NavigationRefreh from 'material-ui/svg-icons/navigation/refresh';
import transitions from 'material-ui/styles/transitions';


import { BinaryFile, SourceFile, makeFromFile} from '../File/';
import composeEnv from '../File/composeEnv';
import template from '../html/screen';
import fallbackTemplate from '../html/dangerScreen';
import screenJs from '../../lib/screen';
import popoutTemplate from '../html/popout';
import Screen, { SrcDocEnabled } from './Screen';
import { MenuHeight } from './Menu';


const FramePadding = 8;

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

const getStyle = (props, context, state) => {
  const {
    isResizing,
    isPopout,
    monitorWidth,
    monitorHeight,
  } = props;
  const { progress } = state;

  return {
    root: {
      flex: '1 1 auto',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      zIndex: 300,
      transition: transitions.easeOut(),
    },
    linear1: {
      borderRadius: 0,
    },
    linear2: {
      borderRadius: 0,
      opacity: progress < 1 ? 1 : 0,
      zIndex: 2,
    },
  };
};

export default class Monitor extends Component {

  static propTypes = {
    showMonitor: PropTypes.bool.isRequired,
    monitorWidth: PropTypes.number.isRequired,
    monitorHeight: PropTypes.number.isRequired,
    isResizing: PropTypes.bool.isRequired,
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    reboot: PropTypes.bool.isRequired,
    togglePopout: PropTypes.func.isRequired,
    portRef: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    width: 300,
    height: 150,
    progress: 0,
    error: null,
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

    if (prevProps.isResizing && !this.props.isResizing) {
      this.handleResize();
    }
  }

  get iframe() {
    return this.props.isPopout ? this.popoutFrame : this.inlineFrame;
  }

  prevent = null;
  start () {
    const { portRef, getConfig } = this.props;

    this.setState({ error: null });
    const env = composeEnv(getConfig('env'));

    let sent = 0;
    const workerProcess = this.props.files
      .filter((file) => !file.options.isTrashed && file.isScript)
      .map((file, i, send) => file.babel(getConfig('babelrc'))
      .then((file) => {
        // To indicate
        const progress = Math.min(1, ++sent / send.length);
        this.setState({ progress });
        return file.serialize();
      }, (error) => {
        // Babel is failed
        return Promise.reject(error);
      }));

    this.prevent =
      (this.prevent || Promise.resolve())
      .then(() => Promise.all([
        new Promise((resolve, reject) => {
          setTimeout(reject, ConnectionTimeout);
          frameLoader(this.iframe, resolve);
        }),
        ...workerProcess,
      ]))
      .then(([frame, ...files]) => {
        const channel = new MessageChannel();
        channel.port1.addEventListener('message', (event) => {
          const reply = (params) => {
            params = Object.assign({
              id: event.data.id,
            }, params);
            channel.port1.postMessage(params);
          };
          this.handleMessage(event, reply);
        });
        portRef(channel.port1);
        channel.port1.start();

        frame.contentWindow.postMessage({
          files, env,
        }, '*', [channel.port2]);
      })
      .catch((error) => {
        if (error) {
          this.setState({ error });
        } else if (this.props.isPopout) {
          this.start();
        }
      });
  }

  handleMessage = ({ data }, reply) => {
    switch (data.query) {
      case 'resize':
        const { width, height } = data.value;
        this.setState({ width, height }, this.handleResize);
        break;
      case 'fetch':
        const file = this.props.findFile(data.value);
        if (file) {
          reply({ value: file.blob });
        } else {
          reply({ error: true });
        }
        break;
      case 'saveAs':
        const [blob, name] = data.value;

        makeFromFile(blob).then((add) => {
          const exist = this.props.findFile(name);
          if (exist) {
            const {key} = exist;
            this.props.putFile(exist, add.set({ key, name }));
          } else {
            this.props.addFile(add.set({ name }));
          }
        });
        break;
      case 'reload':
        this.props.handleRun();
        break;
      case 'error':
        if (!this.state.error) {
          this.setState({ error: new Error(data.message) });
        }
        break;
    }
  };

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
      this.props.togglePopout();
    }
  };

  handleResize = () => {
    const { width, height } = this.state;
    const {
      isPopout,
      isResizing,
      monitorWidth,
      monitorHeight,
    } = this.props;

    if (!this.iframe ||
      !this.iframe.parentNode ||
      (isPopout && this.parent && this.parent.closed) ||
      isResizing
    ) {
      return;
    }
    const screenRect = this.props.isPopout ?
      { width: this.parent.innerWidth, height: this.parent.innerHeight } :
      { width: monitorWidth - FramePadding * 2, height: monitorHeight - FramePadding * 2 };

    this.iframe.width = width + 'px';
    this.iframe.height = height + 'px';

    const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
    const scale = ratio(screenRect) > ratio({ width, height }) ?
      screenRect.width / width : screenRect.height / height;

    this.iframe.style.transform = `scale(${scale})`;
  };

  render() {
    const {
      width,
      height,
      progress,
      error,
    } = this.state;
    const {
      showMonitor,
      isPopout,
      reboot,
      handleRun,
      monitorWidth,
      monitorHeight,
    } = this.props;

    const {
      root,
      container,
      linear1,
      linear2,
    } = getStyle(this.props, this.context, this.state);
    const { prepareStyles } = this.context.muiTheme;

    if (!showMonitor) {
      return isPopout && !reboot ? (
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
            error={error}
          />
        </Popout>
      ) : null;
    }

    return (
      <div style={prepareStyles(root)}>
        <Screen animation
          display={!isPopout}
          frameRef={(ref) => ref && (this.inlineFrame = ref)}
          handleRun={handleRun}
          reboot={reboot}
          error={error}
        />
        <LinearProgress
          mode="determinate"
          max={1}
          value={progress}
          style={linear1}
        />
        <LinearProgress mode="indeterminate" style={linear2} />
      </div>
    );
  }
}
