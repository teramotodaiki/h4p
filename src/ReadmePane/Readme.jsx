import React, { PureComponent, PropTypes } from 'react';
import transitions from 'material-ui/styles/transitions';
import { emphasize } from 'material-ui/utils/colorManipulator';
import markdownItContainer from 'markdown-it-container';


import MDReactComponent from '../../lib/MDReactComponent';
import { Tab } from '../ChromeTab/';
import { Editor } from '../EditorPane/';
import ShotFrame from './ShotFrame';

const BarHeight = 36;

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
    code: {
      backgroundColor: emphasize(palette.canvasColor, 0.07),
      padding: '.2em',
      borderRadius: 2,
    },
    a: {
      backgroundColor: palette.primary1Color,
      color: palette.alternateTextColor,
      borderRadius: 2,
      textDecoration: 'none',
      padding: '.4em',
      lineHeight: 2,
    },
  };
};

const customContainers = {
  color(param) {
    return {
      style: {
        color: param,
      },
    };
  },
};

const plugins = [
  {
    plugin: markdownItContainer,
    args: [null, {
      validate(param) {
        const [marker] = param.split(':');
        return Object.keys(customContainers).includes(marker.trim());
      },
    }],
  }
];

export default class Readme extends PureComponent {

  static propTypes = {
    file: PropTypes.object.isRequired,
    onShot: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    completes: PropTypes.array.isRequired,
    setLocation: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  renderIterate(tag, props, children) {
    const {
      findFile,
      selectTab,
      getConfig,
      localization,
      completes,
    } = this.props;

    if (['blockquote', 'table', 'th', 'td', 'code'].includes(tag)) {
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
      } else {
        props = {...props, target: '_blank'};
      }

      return <a {...props}>{children}</a>;
    }
    if (tag === 'img') {
      if (!isValidURL(props.src)) {
        const file = findFile(decodeURIComponent(props.src));
        if (!file) {
          return <span {...props}>{props.alt}</span>
        }
        if (file.is('image')) {
          return <img {...props} src={file.blobURL} />
        }
        if (file.is('html')) {
          const onTouchTap = (event) => {
            event.stopPropagation();
            this.props.setLocation({
              href: file.name,
            });
          };
          return (
            <a key={props.key}
              href="javascript: void(0)"
              onTouchTap={onTouchTap}
            >{props.alt}</a>
          );
        }
      }
      return <img {...props} />
    }
    if (tag === 'pre') {
      return (
        <ShotFrame
          key={props.key}
          text={children[0].props.children[0] || ''}
          onShot={this.props.onShot}
          localization={localization}
          getConfig={getConfig}
          completes={completes}
        />
      );
    }
    if ('data-info' in props) {
      const [marker,param] = props['data-info'].split(':').map(s => s.trim());
      return (
        <span {...props} {...customContainers[marker.trim()](param)}>
        {children}
        </span>
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

    const styles = {
      root: {
        boxSizing: 'border-box',
        overflow: 'scroll',
      },
    };

    return (
      <MDReactComponent
        text={file.text}
        style={styles.root}
        onIterate={onIterate}
        plugins={plugins}
      />
    );
  }
}


function isValidURL(text) {
  const a = document.createElement('a');
  a.href = text;
  return a.host && a.host != window.location.host;
}
