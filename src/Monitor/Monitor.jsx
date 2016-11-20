import React, { Component, PropTypes } from 'react';
import Popout from '../jsx/ReactPopout';
import { transform } from 'babel-standalone';
import IconButton from 'material-ui/IconButton';
import LinearProgress from 'material-ui/LinearProgress';
import NavigationRefreh from 'material-ui/svg-icons/navigation/refresh';


import composeEnv from '../js/composeEnv';
import template from '../html/screen';
import fallbackTemplate from '../html/dangerScreen';
import screenJs from '../../lib/screen';
import popoutTemplate from '../html/popout';
import Screen, { SrcDocEnabled } from './Screen';
import Menu from './Menu';
import Sizer from './Sizer';
import babelWorker from '../workers/babel-worker';

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
    isPopout,
    monitorSize: { width, height },
  } = props;
  const { progress } = state;

  const menuHeight = 40;

  return {
    root: {
      position: 'relative',
      flex: '0 0 auto',
      width,
      height: isPopout ? 0 : height,
      maxWidth: '100%',
      maxHeight: '100%',
      minWidth: 0,
      minHeight: menuHeight,
      zIndex: 300,
    },
    container: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      zIndex: 1,
    },
    linear1: {
      position: 'absolute',
      bottom: menuHeight - 6,
      zIndex: 201,
    },
    linear2: {
      position: 'absolute',
      bottom: menuHeight - 4,
      opacity: progress < 1 ? 1 : 0,
      zIndex: 202,
    },
  };
};

export default class Monitor extends Component {

  static propTypes = {
    monitorSize: PropTypes.object.isRequired,
    handleResize: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    options: PropTypes.object.isRequired,
    isPopout: PropTypes.bool.isRequired,
    reboot: PropTypes.bool.isRequired,
    env: PropTypes.object.isRequired,
    togglePopout: PropTypes.func.isRequired,
    portRef: PropTypes.func.isRequired,
    babelrc: PropTypes.object.isRequired,
    handleRun: PropTypes.func.isRequired,
    updatePalette: PropTypes.func.isRequired,
    updateEnv: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    setLocalization: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    width: 300,
    height: 150,
    progress: 0,
    hover: false,
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
      this.props.monitorSize.width !== prevProps.monitorSize.width ||
      this.props.monitorSize.height !== prevProps.monitorSize.height
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

    const env = composeEnv(this.props.env);

    let sent = 0;
    const workerProcess = this.props.files
      .filter((file) => file.moduleName)
      .filter((file) => !file.options.isTrashed)
      .map((file, i, send) => babelWorker(file, babelrc)
      .then((file) => {
        // To indicate
        const progress = Math.min(1, ++sent / send.length);
        this.setState({ progress });
        return file;
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
      this.props.togglePopout();
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

  handleMouseEnter = () => {
    this.setState({ hover: true });
  };

  handleMouseLeave = () => {
    this.setState({ hover: false });
  };

  render() {
    const {
      width,
      height,
      progress,
      hover,
    } = this.state;
    const {
      monitorSize,
      isPopout,
      reboot,
      handleRun,
      handleResize,
    } = this.props;

    const menuProps = {
      files: this.props.files,
      options: this.props.options,
      palette: this.props.palette,
      env: this.props.env,
      updatePalette: this.props.updatePalette,
      updateEnv: this.props.updateEnv,
      openFileDialog: this.props.openFileDialog,
      togglePopout: this.props.togglePopout,
      localization: this.props.localization,
      setLocalization: this.props.setLocalization,
      availableLanguages: this.props.availableLanguages,
      isPopout,
      hover,
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
    };

    const {
      root,
      container,
      linear1,
      linear2
    } = getStyle(this.props, this.context, this.state);
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
          <LinearProgress
            mode="determinate"
            max={1}
            value={progress}
            style={linear1}
          />
          <LinearProgress mode="indeterminate" style={linear2} />
          <Menu {...menuProps} />
        </div>
        <Sizer
          width={monitorSize.width}
          height={monitorSize.height}
          hover={hover}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          handleResize={handleResize}
        />
      </div>
    );
  }
}
