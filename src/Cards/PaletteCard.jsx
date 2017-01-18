import React, { PureComponent, PropTypes } from 'react';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import Popover from 'material-ui/Popover';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import { convertColorToString } from 'material-ui/utils/colorManipulator';
import { transparent, fullWhite } from 'material-ui/styles/colors';
import { ChromePicker, TwitterPicker } from 'react-color';


import LayeredStyle from './LayeredStyle';
import { commonRoot } from './commonStyles';


const getStyles = (props, context) => {
  const {
    palette,
    spacing,
  } = context.muiTheme;

  const bodyColor = getComputedStyle(document.body)['background-color'];
  const boxSize = 60;

  return {
    html: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: fullWhite,
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
      height: boxSize + 32,
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

export default class PalettePane extends PureComponent {

  static propTypes = {
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    palette: this.props.getConfig('palette'),
    open: false,
    key: null,
    anchorEl: null,
    limited: false,
  };

  handleRectClick = (event, key, limited = false) => {
    event.stopPropagation();
    const anchorEl = event.target;
    const color = this.state.palette[key];
    this.setState({ open: true, key, anchorEl, color, limited });
  };

  handleChangeComplete = (structure) => {
    const { key } = this.state;
    const { setConfig } = this.props;

    const { r, g, b, a } = structure.rgb;
    const color = ({ type: 'rgba', values: [r, g, b, a] });

    const palette = Object.assign({}, this.state.palette, {
      [key]: convertColorToString(color),
    });
    setConfig('palette', palette)
      .then((file) => file.json)
      .then(palette => this.setState({ palette }));
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
    const {
      localization,
    } = this.props;
    const { open, key, anchorEl, limited } = this.state;
    const { palette, prepareStyles } = this.context.muiTheme;

    const styles = getStyles(this.props, this.context);
    styles.item = prepareStyles(styles.item);
    styles.label = prepareStyles(styles.label);

    return (
      <Card style={commonRoot}>
        <CardHeader showExpandableButton actAsExpander
          title={localization.palette.title}
          subtitle={localization.palette.subtitle}
        />
        <CardActions>
          <LayeredStyle
            styles={[
              prepareStyles(styles.html),
              prepareStyles(styles.body),
              prepareStyles(styles.overlay),
            ]}
            onTouchTap={(e) => this.handleRectClick(e, 'backgroundColor')}
          >
            <Paper
              style={styles.canvas}
              onTouchTap={(e) => this.handleRectClick(e, 'canvasColor')}
            >
              <Paper
                style={styles.primary}
                onTouchTap={(e) => this.handleRectClick(e, 'primary1Color', true)}
              />
              <Paper
                style={styles.secondary}
                onTouchTap={(e) => this.handleRectClick(e, 'accent1Color', true)}
              />
              <div style={prepareStyles(styles.blank)}></div>
            </Paper>
          </LayeredStyle>
        </CardActions>
        <CardText expandable
          style={styles.container}
        >
        {Object.keys(palette).map((key) => this.renderItem(key, styles))}
        </CardText>
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
      </Card>
    );
  }
}
