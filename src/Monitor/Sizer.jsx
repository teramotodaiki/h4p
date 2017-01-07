import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import transitions from 'material-ui/styles/transitions';


import SizerDragSource from './SizerDragSource';

const SkewY = 66;
export const SizerWidth = 24;

const getStyles = (props, context) => {

  const { monitorWidth, monitorHeight } = props;
  const {
    palette,
    spacing,
  } = context.muiTheme;

  const blade = SizerWidth * Math.tan(SkewY / 180 * Math.PI);

  return {
    root: {
      position: 'absolute',
      top: 0,
      left: monitorWidth,
      width: SizerWidth,
      height: monitorHeight,
      maxHeight: '100%',
      paddingRight: spacing.desktopGutterMini,
      paddingBottom: spacing.desktopGutterMini,
      overflow: 'hidden',
      cursor: 'col-resize',
      zIndex: 2,
      transition: transitions.easeOut(),
    },
    preview: {
      width: '100%',
      height: '100%',
      marginTop: -blade / 2,
      transform: `skewY(${-SkewY}deg)`,
      backgroundColor: 'transparent',
    },
    color: {
      width: '100%',
      height: '100%',
      backgroundColor: palette.primary1Color,
    },
  };

};

class Sizer extends Component {

  static propTypes = {
    monitorWidth: PropTypes.number.isRequired,
    monitorHeight: PropTypes.number.isRequired,
    onSizer: PropTypes.func.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    hover: false,
    isActive: false,
  };

  prevent = {};

  componentWillReceiveProps(nextProps) {
    const { isDragging, onSizer } = this.props;

    if (!isDragging && nextProps.isDragging) {
      onSizer(true);
    } else if (isDragging && !nextProps.isDragging) {
      onSizer(false);
    }
  }

  render() {
    const {
      connectDragSource,
      connectDragPreview,
    } = this.props;

    const {
      root,
      color,
      preview,
    } = getStyles(this.props, this.context);

    return connectDragSource(
      <div
        style={root}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
      {connectDragPreview(
        <div style={preview}>
          <Paper
            rounded={false}
            zDepth={this.state.hover ? 2 : 1}
            style={color}
          />
        </div>
      )}
      </div>
    );
  }
}


export default SizerDragSource(Sizer);
