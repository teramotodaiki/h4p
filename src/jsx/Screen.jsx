import React, { Component, PropTypes } from 'react';
import Postmate from 'postmate/build/postmate.min';

Postmate.debug = process.env.NODE_ENV !== 'production';


export default class Screen extends Component {

  static propTypes = {
    player: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired
  };

  state = {
    width: 300,
    height: 150,
    frame: null
  };

  url = 'https://embed.hackforplay.xyz/open-source/screen/alpha-3.html';

  componentWillReceiveProps(nextProps) {
    if (this.props.app === nextProps.app) return;

    // Only iframe mode
    this.start(nextProps.app);
  }

  prevent = null;
  start(app) {
    const { player, screen } = this.props;

    this.prevent =
      (this.prevent || Promise.resolve())
      .then(() => {
        player.emit('screen.beforeunload'); // call beforeunload

        return new Postmate({
          container: this.container,
          url: this.url,
          model: app
        });
      })
      .then(child => {
        this.setState({ frame: child.frame });

        const resized = (view) => player.emit('screen.resize', view);
        child.get('size').then(resized);
        child.on('resize', resized);
        player.once('screen.beforeunload', () => child.destroy());

        player.emit('screen.load', { child });
      });
  }

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
    const { frame, width, height } = this.state;
    if (!frame) return;
    const screenRect = this.container.getBoundingClientRect();

    frame.width = width;
    frame.height = height;

    const translate = {
      x: (screenRect.width - width) / 2,
      y: (screenRect.height - height) / 2
    };
    const ratio = (size) => Math.max(size.height, 1) / Math.max(size.width, 1);
    const scale = ratio(screenRect) > ratio({ width, height }) ?
      screenRect.width / width : screenRect.height / height;

    frame.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
  };


  render() {
    const style = Object.assign({
      backgroundColor: 'black',
    }, this.props.style);

    return (
      <div
        ref={(container) => this.container = container}
        style={style}
        className={CSS_PREFIX + 'frame_container-screen'}
      />
    );
  }
}
