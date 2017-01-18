import React, { PureComponent, PropTypes } from 'react';
import Popout from '../jsx/ReactPopout';
import IconButton from 'material-ui/IconButton';
import LinearProgress from 'material-ui/LinearProgress';
import NavigationRefreh from 'material-ui/svg-icons/navigation/refresh';
import transitions from 'material-ui/styles/transitions';


import { BinaryFile, SourceFile, makeFromFile} from '../File/';
import composeEnv from '../File/composeEnv';
import popoutTemplate from '../html/popout';
import Screen from './Screen';
import setSrcDoc from './setSrcDoc';
import registerHTML from './registerHTML';

const FramePadding = 8;

const ConnectionTimeout = 1000;
const popoutURL = URL.createObjectURL(
  new Blob([popoutTemplate()], { type: 'text/html' })
);


const getStyle = (props, context, state) => {
  const {
    palette,
  } = context.muiTheme;

  return {
    root: {
      flex: '1 1 auto',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      zIndex: 300,
    },
    linear1: {
      position: 'absolute',
      bottom: 0,
      borderRadius: 0,
      height: 8,
    },
    linear2: {
      position: 'absolute',
      bottom: 0,
      borderRadius: 0,
      opacity: state.progress < 1 ? 1 : 0,
    },
    progressColor: props.show ?
       palette.accent1Color : palette.primary1Color,
  };
};

export default class Monitor extends PureComponent {

  static propTypes = {
    show: PropTypes.bool.isRequired,
    monitorWidth: PropTypes.number.isRequired,
    monitorHeight: PropTypes.number.isRequired,
    isResizing: PropTypes.bool.isRequired,
    files: PropTypes.array.isRequired,
    isPopout: PropTypes.bool.isRequired,
    reboot: PropTypes.bool.isRequired,
    href: PropTypes.string.isRequired,
    togglePopout: PropTypes.func.isRequired,
    portRef: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    width: 300,
    height: 150,
    progress: 0,
    error: null,
    port: null,
  };

  popoutOptions = {
    width: 300,
    height: 150,  // means innerHeight of browser expecting Safari.
    left: 50,
    top: 50,
  };

  popoutClosed = false;

  componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files && this.state.port) {
      const files = this.props.files
        .map((item) => item.watchSerialize());

      this.state.port.postMessage({
        query: 'watch',
        value: files,
      });
    }
  }

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

  get href() {
    return this.props.href || 'index.html';
  }

  prevent = Promise.resolve();
  async start () {
    const _prevent = this.prevent;

    this.prevent = _prevent
      .then(() => this.startProcess())
      .catch((error) => {
        if (error) {
          this.setState({ error });
        } else if (this.props.isPopout) {
          this.start();
        }
      });

    await _prevent;

    this.setState({ error: null, port: null });
  }

  async startProcess() {
    const { portRef, getConfig } = this.props;

    const babelrc = getConfig('babelrc');
    const env = composeEnv(getConfig('env'));

    const scriptFiles = this.props.files
      .filter((file) => !file.options.isTrashed && file.isScript);

    const indicate = ((sent) => () => {
      const progress = Math.min(1, ++sent / scriptFiles.length);
      this.setState({ progress });
    })(0);

    const buildProcess = scriptFiles
      .map((file) => {
        return file.babel(babelrc)
          .then((es5) => indicate() || es5);
      });
    const processedFiles = await Promise.all(buildProcess);

    const htmlFile = this.props.findFile(this.href) || SourceFile.html();

    const html = await registerHTML(
      htmlFile.text,
      this.props.findFile,
      processedFiles,
      env
    );

    await new Promise((resolve, reject) => {
      setSrcDoc(this.iframe, html, resolve);
      setTimeout(() => {
        reject(new Error('Connection Timeout'));
      }, ConnectionTimeout);
    });

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
    this.handlePort(channel.port1);

    const files = this.props.files
      .map((item) => item.watchSerialize());

    this.iframe.contentWindow.postMessage({
      files, env,
    }, '*', [channel.port2]);

  }

  handlePort(port) {
    this.props.portRef(port);
    port.start();
    this.setState({ port });
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
        this.handleReload();
        break;
      case 'replace':
        this.props.setLocation({
          href: data.value,
        });
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

  handleFrame = (ref) => {
    if (!ref) return;

    if (this.props.show) {
      this.inlineFrame = ref;
    } else {
      this.popoutFrame = ref;
    }
  };

  handleReload = () => {
    this.props.setLocation({
      href: this.props.href,
    });
  };

  render() {
    const {
      progress,
      error,
    } = this.state;
    const {
      show,
      isPopout,
      reboot,
    } = this.props;

    if (!show) {
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
            frameRef={this.handleFrame}
            handleReload={this.handleReload}
            reboot={reboot}
            error={error}
          />
        </Popout>
      ) : null;
    }

    const styles = getStyle(this.props, this.context, this.state);

    return (
      <div style={styles.root}>
        <Screen animation
          display={!isPopout}
          frameRef={this.handleFrame}
          handleReload={this.handleReload}
          reboot={reboot}
          error={error}
        />
        <LinearProgress
          mode="determinate"
          max={1}
          value={progress}
          style={styles.linear1}
          color={styles.progressColor}
        />
        <LinearProgress
          mode="indeterminate"
          style={styles.linear2}
          color={styles.progressColor}
        />
      </div>
    );
  }
}
