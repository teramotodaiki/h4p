import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import transitions from 'material-ui/styles/transitions';
import CommunicationImportContacts from 'material-ui/svg-icons/communication/import-contacts';


import MDReactComponent from '../../lib/MDReactComponent';
import Editor from './Editor';
import ShotFrame from './ShotFrame';

const BarHeight = 36;

const getStyle = (props, state, context) => {
  const {
    show,
  } = state;
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;

  return {
    root: prepareStyles({
      position: 'absolute',
      width: '100%',
      height: show ? '100%' : BarHeight,
      bottom: 0,
      boxSizing: 'border-box',
      padding: 0,
      paddingRight: spacing.desktopGutterMini,
      paddingLeft: spacing.desktopGutterMore,
      zIndex: 20,
      transition: transitions.easeOut(),
    }),
    container: {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      borderWidth: 1,
      borderBottomWidth: 0,
      borderStyle: 'solid',
      borderColor: palette.accent1Color,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    header: {
      flex: '0 0 auto',
      height: BarHeight,
      color: palette.alternateTextColor,
      backgroundColor: palette.accent1Color,
      borderRadius: 0,
    },
    markdown: prepareStyles({
      flex: '1 1 auto',
      display: 'block',
      overflow: 'scroll',
      paddingLeft: spacing.desktopGutterMini,
      paddingRight: spacing.desktopGutterMore,
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
    files: PropTypes.array.isRequired,
    readme: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    onTouchTap: PropTypes.func.isRequired,
    onShot: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    show: true,
    updates: {},
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.show && !nextState.show) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.readme !== nextProps.readme) {
      this.setState({ updates: {} });
    }
  }

  handleBarTouch = () => {
    const show = !this.state.show;
    this.setState({ show });

    this.props.onTouchTap();
  };

  renderIterate(tag, props, children) {
    if (['blockquote', 'table', 'th', 'td'].includes(tag)) {
      return React.createElement(tag, props, children);
    }
    if (tag === 'a') {
      return <a {...props} target="_blank">{children}</a>;
    }
    if (tag === 'img') {
      const file = this.props.files.find((file) =>
        !file.options.isTrashed && (
        file.name === props.src ||
        file.moduleName === props.src)
      );
      if (file) {
        return <img {...props} src={file.blobURL} />
      }
    }
    if (tag === 'pre') {
      const { updates } = this.state;
      const hasUpdate = typeof updates[props.key] === 'string';
      const text = hasUpdate ? updates[props.key] : children[0].props.children[0];
      const onChange = (text) => this.setState({
        updates: Object.assign({}, updates, { [props.key]: text })
      });
      const onRestore = () => this.setState({
        updates: Object.assign({}, updates, { [props.key]: null }),
      });

      return (
        <ShotFrame
          key={props.key}
          onShot={() => this.props.onShot(text)}
          onRestore={onRestore}
          canRestore={hasUpdate}
        >
          <Editor isSelected
            file={{ text, type: 'text/javascript', options: {} }}
            options={this.props.options}
            getFiles={() => []}
            onChange={onChange}
            handleRun={() => this.props.onShot(text)}
            closeSelectedTab={() => {}}
            isCared
          />
        </ShotFrame>
      );
    }

    return null;

  };

  render() {
    const {
      readme,
      localization,
    } = this.props;

    const {
      prepareStyles,
    } = this.context.muiTheme;

    const {
      root,
      container,
      header,
      markdown,
    } = getStyle(this.props, this.state, this.context);

    const {
      gettingStarted,
    } = localization.readme;

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
        <Paper style={container}>
          <FlatButton
            label={gettingStarted}
            icon={<CommunicationImportContacts />}
            style={header}
            onTouchTap={this.handleBarTouch}
          />
          <MDReactComponent
            text={readme}
            style={markdown}
            onIterate={onIterate}
          />
        </Paper>
      </div>
    );
  }
}
