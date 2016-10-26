import React, { Component, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import Popover from 'material-ui/Popover';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import { convertColorToString } from 'material-ui/utils/colorManipulator';
import { transparent, fullWhite } from 'material-ui/styles/colors';
import ActionList from 'material-ui/svg-icons/action/list';
import { ChromePicker, TwitterPicker } from 'react-color';


const getStyles = (props, context, state) => {
  const { palette, spacing, button } = context.muiTheme;
  const { showAll } = state;

  const bodyColor = getComputedStyle(document.body)['background-color'];
  const boxSize = 100;

  return {
    root: {
      overflowY: 'scroll',
    },
    html: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: fullWhite,
      marginBottom: spacing.desktopGutterMore,
    },
    body: {
      backgroundColor: bodyColor,
    },
    overlay: {
      padding: spacing.desktopGutterMore,
      backgroundColor: palette.backgroundColor,
    },
    canvas: {
      display: 'flex',
      alignItems: 'center',
      height: boxSize + spacing.desktopGutterMore * 2,
      backgroundColor: palette.canvasColor,
    },
    primary: {
      flex: '1 1 auto',
      marginLeft: spacing.desktopGutterMore,
      height: boxSize,
      backgroundColor: palette.primary1Color,
    },
    secondary: {
      flex: '1 1 auto',
      marginLeft: spacing.desktopGutterMore,
      height: boxSize * 0.8,
      backgroundColor: palette.accent1Color,
    },
    blank: {
      flex: '1 1 auto',
      marginLeft: spacing.desktopGutterMore,
      height: boxSize,
      backgroundColor: transparent,
    },
    container: {
      maxHeight: showAll ? 1000 : button.height,
      textAlign: 'center',
      overflow: 'hidden',
    },
    item: {
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      maxWidth: 200,
      margin: `${spacing.desktopGutterMini}px auto`,
    },
    label: {
      color: palette.textColor,
    },
    rect: {
      boxSizing: 'border-box',
      marginLeft: spacing.desktopGutter,
      padding: '.5rem',
      border: `1px solid ${palette.textColor}`,
    }
  };
};

export default class CustomDialog extends Component {

  static propTypes = {
    palette: PropTypes.object.isRequired,
    updatePalette: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    palette: this.props.palette,
    open: false,
    key: null,
    anchorEl: null,
    limited: false,
    showAll: false,
  };

  handleRectClick = (event, key, limited = false) => {
    event.stopPropagation();
    const anchorEl = event.target;
    const color = this.state.palette[key];
    this.setState({ open: true, key, anchorEl, color, limited });
  };

  handleChangeComplete = (structure) => {
    const { key } = this.state;
    const { updatePalette } = this.props;

    const { r, g, b, a } = structure.rgb;
    const color = ({ type: 'rgba', values: [r, g, b, a] });
    updatePalette({ [key]: convertColorToString(color) })
      .then(palette => this.setState({ palette }));
  };

  toggleShowAll = () => {
    const showAll = !this.state.showAll;
    this.setState({ showAll });
  };

  closePopover = () => {
    this.setState({ open: false });
  };

  renderItem(key, styles) {
    const {
      palette,
      prepareStyles,
    } = this.context.muiTheme;

    const rectStyle = Object.assign({}, styles.rect, {
      backgroundColor: palette[key],
    });

    return (
      <div key={key} style={styles.item}>
        <span style={styles.label}>{key}</span>
        <span
          style={prepareStyles(rectStyle)}
          onTouchTap={(event) => this.handleRectClick(event, key)}
        ></span>
      </div>
    );
  }

  render() {
    const { onRequestClose } = this.props;
    const { open, key, anchorEl, showAll, limited } = this.state;
    const { palette, prepareStyles } = this.context.muiTheme;

    const styles = getStyles(this.props, this.context, this.state);
    styles.item = prepareStyles(styles.item);
    styles.label = prepareStyles(styles.label);

    return (
      <Dialog open
        title="Colors"
        modal={false}
        bodyStyle={styles.root}
        onRequestClose={onRequestClose}
      >
        <LayeredStyle
          styles={[
            prepareStyles(styles.html),
            prepareStyles(styles.body),
            prepareStyles(styles.overlay),
          ]}
          onTouchTap={e => this.handleRectClick(e, 'backgroundColor')}
        >
          <Paper
            style={styles.canvas}
            onTouchTap={e => this.handleRectClick(e, 'canvasColor')}
          >
            <Paper
              style={styles.primary}
              onTouchTap={e => this.handleRectClick(e, 'primary1Color', true)}
            />
            <Paper
              style={styles.secondary}
              onTouchTap={e => this.handleRectClick(e, 'accent1Color', true)}
            />
            <div style={prepareStyles(styles.blank)}></div>
          </Paper>
        </LayeredStyle>
        <div style={prepareStyles(styles.container)}>
          <FlatButton secondary
            icon={<ActionList />}
            onTouchTap={this.toggleShowAll}
          />
          {showAll ? (
            Object.keys(palette).map(key => this.renderItem(key, styles))
          ): null}
        </div>
        <Popover
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onRequestClose={this.closePopover}
        >
        {limited ? (
          <TwitterPicker
            color={key && palette[key]}
            onChangeComplete={this.handleChangeComplete}
          />
        ) : (
          <ChromePicker
            color={key && palette[key]}
            onChangeComplete={this.handleChangeComplete}
          />
        )}
        </Popover>
      </Dialog>
    );
  }
}

const isEmpty = (array) => !array || !array.length;

const LayeredStyle = (props) => {
  if (isEmpty(props.styles)) {
    return (
      <div {...props}>
      {props.children}
      </div>
    );
  }

  const styles = [props.style].concat(props.styles)
    .filter(s => s);

  const nextProps = Object.assign({}, props, {
    style: styles[1],
    styles: styles.slice(2)
  });
  if (isEmpty(nextProps.styles)) {
    delete nextProps.styles;
  }

  return (
    <div style={styles[0]}>
      <LayeredStyle {...nextProps} />
    </div>
  );
};
