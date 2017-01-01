import React, { Component, PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import Paper from 'material-ui/Paper';


import DragTypes from '../utils/dragTypes';

const TOUCH_START = 'touchstart' in document ? 'onTouchStart' : 'onMouseDown';
const TOUCH_END = 'touchend' in document ? 'onTouchEnd' : 'onMouseUp';

const getStyle = (props, context, state) => {
  const {
    isDragging,
  } = props;

  const {
    palette,
  } = context.muiTheme;

  const {
    code,
  } = state;

  return {
    root: {
      position: 'relative',
      flex: '0 0 auto',
      boxSizing: 'border-box',
      width: '6rem',
      height: '6rem',
      padding: 8,
      zIndex: code ? 2 : 1,
    },
    container: {
      width: '100%',
      height: '100%',
      cursor: 'move',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      width: '100%',
      height: '100%',
    },
    pre: {
      backgroundColor: palette.canvasColor,
    },
    prefix: {
      textAlign: 'center',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      fontSize: '1rem',
      padding: '.5rem 0',
    },
    leftLabel: {
      textAlign: 'center',
      fontSize: '.5rem',
    },
  };
};

class SnippetButton extends Component {

  static propTypes = {
    snippet: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,

    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    code: false,
  };

  handleTouch = (event) => {
    const { snippet, findFile, localization } = this.props;
    const styles = {
      container: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: '.5rem 0',
      },
      label: {
        padding: '0 .5rem',
      },
      plane: {
        position: 'absolute',
        fontSize: '.5rem',
        right: 0,
      },
    };

    this.props.onSelect(event, (
      <div style={styles.container}>
        <span style={styles.plane}>{snippet.plane}</span>
        <span style={styles.label}>{snippet.prefix}</span>
        <span style={styles.label}>{snippet.description}</span>
        {snippet.descriptionMoreURL ? (
          <a href={snippet.descriptionMoreURL} style={styles.label} target="_blank">
            {localization.snippet.readMore}
          </a>
        ) : null}
        <code style={styles.label}>{snippet.rightLabel}</code>
      </div>
    ));
  };

  render() {
    const {
      snippet,
      isDragging,
      findFile,

      connectDragSource,
      connectDragPreview,
    } = this.props;
    const {
      code,
    } = this.state;

    const {
      root,
      container,
      pre,
      button,
      left,
      leftLabel,
      prefix,
    } = getStyle(this.props, this.context, this.state);

    const events = {
      [TOUCH_START]: () => this.setState({ code: true }),
      [TOUCH_END]: () => this.setState({ code: false }),
      onTouchTap: this.handleTouch,
    };

    return (
      <div style={root}>
      {connectDragSource(
        <div style={container} {...events}>
        {code ? connectDragPreview(
          <pre style={pre}>{snippet.text}</pre>
        ) : (
          <Paper style={button}>
            <div style={prefix}>{snippet.prefix}</div>
            <div style={leftLabel}>
              <SnippetInnerElement
                label={snippet.leftLabel}
                findFile={this.props.findFile}
              />
            </div>
          </Paper>
        )}
        </div>
      )}
      </div>
    );
  }
}


const spec = {
  beginDrag(props, monitor, component) {
    const { snippet } = props;
    setTimeout(() => {
      component.setState({ code: false });
    }, 1);
    return { snippet };
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
});

export default DragSource(DragTypes.Snippet, spec, collect)(SnippetButton)


export class SnippetInnerElement extends Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    findFile: PropTypes.func.isRequired,
  };

  state = {
    element: this.parseHTMLString(this.props.label),
  };

  setStyle (ref, style) {
    if (!ref) {
      return;
    }
    Array.from({ length: style.length })
      .map((_, i) => style.item(i))
      .map((name) => ref.style.setProperty(name, style.getPropertyValue(name)));
  }

  parseHTMLString(label) {
    const html = (new DOMParser()).parseFromString(label, 'text/html');
    const elem = html.body.firstChild;

    if (elem && elem.tagName) {
      const handleRef = (ref) => {
        this.setStyle(ref, elem && elem.style);
      };

      if (elem.tagName === 'IMG') {
        const file = this.props.findFile(elem.getAttribute('src'));
        const fit = { maxWidth: '100%', maxHeight: '100%' };
        return <img ref={handleRef} style={fit} src={file && file.blobURL}  />;
      } else {
        return <elem.tagName ref={handleRef}>{elem.innerHTML}</elem.tagName>;
      }
    }

    return <span>{label}</span>;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.label !== nextProps.label) {
      this.setState({
        element: this.parseHTMLString(nextProps.label),
      });
    }
  }

  render() {
    return this.state.element;
  }
}
