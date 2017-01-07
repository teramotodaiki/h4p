import React, { Component, PropTypes } from 'react';
import transitions from 'material-ui/styles/transitions';


import MDReactComponent from '../../lib/MDReactComponent';
import { SourceFile } from '../File/';
import { SizerWidth } from '../Monitor/';
import { Tab } from '../ChromeTab/';
import Editor from './Editor';
import ShotFrame from './ShotFrame';

const BarHeight = 36;

const getStyle = (props, state, context) => {
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;

  return {
    root: prepareStyles({
      position: 'absolute',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      paddingLeft: SizerWidth,
      paddingRight: spacing.desktopGutterMini,
      display: 'flex',
      transition: transitions.easeOut(),
      backgroundColor: palette.canvasColor,
    }),
    markdown: prepareStyles({
      flex: '1 1 auto',
      display: 'block',
      overflow: 'scroll',
      paddingLeft: spacing.desktopGutterMini,
      paddingBottom: spacing.desktopGutterMore,
    }),
  };
};

const mdStyle = (props, state, context) => {
  const {
    palette,
    spacing,
  } = context.muiTheme;

  const tableBorder = `1px solid ${palette.disabledColor}`;

  return {
    blockquote: {
      color: palette.secondaryTextColor,
      marginLeft: '1rem',
      paddingLeft: '1rem',
      borderLeft: `5px solid ${palette.disabledColor}`,
    },
    img: {
      maxWidth: '100%',
    },
    table: {
      margin: '1rem 0',
      borderLeft: tableBorder,
      borderSpacing: 0,
    },
    th: {
      padding: spacing.desktopGutterMini,
      borderTop: tableBorder,
      borderRight: tableBorder,
      borderBottom: tableBorder,
    },
    td: {
      padding: spacing.desktopGutterMini,
      borderRight: tableBorder,
      borderBottom: tableBorder,
    },
  };
};

export default class Readme extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onShot: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    port: PropTypes.object,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    updates: {},
    completes: [],
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.props.isSelected && !nextProps.isSelected) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.readme !== nextProps.readme) {
      this.setState({ updates: {} });
    }
    if (this.props.port !== nextProps.port) {
      nextProps.port.addEventListener('message', (event) => {
        if (event.data.query === 'complete') {
          this.setState({
            completes: event.data.value,
          });
        }
      });
    }
  }

  renderIterate(tag, props, children) {
    const {
      findFile,
      selectTab,
      getConfig,
      localization,
    } = this.props;
    const {
      completes,
    } = this.state;

    if (['blockquote', 'table', 'th', 'td'].includes(tag)) {
      return React.createElement(tag, props, children);
    }
    if (tag === 'a') {
      const href = decodeURIComponent(props.href);
      if (!isValidURL(href)) {
        props = Object.assign({}, props, {
          href: 'javascript:void(0)',
          onTouchTap: () => {
            const found = findFile(href);
            if (found) {
              const getFile = () => findFile(({key}) => key === found.key);
              selectTab(new Tab({ getFile }));
            }
          },
        });
      }
      return <a {...props} target="_blank">{children}</a>;
    }
    if (tag === 'img') {
      const file = findFile(decodeURIComponent(props.src));
      if (file) {
        props = Object.assign({}, props, {
          src: file.blobURL,
        });
      }
      return <img {...props} />
    }
    if (tag === 'pre') {
      const { updates } = this.state;
      const getInit = () => new SourceFile({
        type: 'text/javascript',
        text: children[0].props.children[0],
      });
      const hasFile = updates[props.key] instanceof SourceFile;
      const file = hasFile ? updates[props.key] : getInit();
      const update = (nextFile) => new Promise((resolve, reject) => {
        const updates = Object.assign({},
          this.state.updates,
          { [props.key]: nextFile });
        this.setState({ updates }, () => resolve(nextFile));
      });
      const onChange = (text) => update(file.set({ text }));
      const onRestore = () => update(getInit());

      return (
        <ShotFrame
          key={props.key}
          file={file}
          onShot={this.props.onShot}
          onRestore={onRestore}
          canRestore={hasFile}
          onChange={onChange}
          localization={localization}
          getConfig={getConfig}
          completes={completes}
        />
      );
    }

    return null;

  };

  render() {
    const {
      file,
    } = this.props;

    const {
      prepareStyles,
    } = this.context.muiTheme;

    const {
      root,
      markdown,
    } = getStyle(this.props, this.state, this.context);

    const mdStyles = mdStyle(this.props, this.state, this.context);

    const onIterate = (tag, props, children) => {
      if (mdStyles[tag]) {
        const style = prepareStyles(
          Object.assign({}, props.style || {}, mdStyles[tag])
        );
        props = Object.assign({}, props, { style });
      }
      return this.renderIterate(tag, props, children);
    };

    return (
      <div style={root}>
        <MDReactComponent
          text={file.text}
          style={markdown}
          onIterate={onIterate}
        />
      </div>
    );
  }
}


function isValidURL(text) {
  const a = document.createElement('a');
  a.href = text;
  return a.host && a.host != window.location.host;
}
