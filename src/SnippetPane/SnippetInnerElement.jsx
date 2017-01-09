import React, { PureComponent, PropTypes } from 'react';


export default class SnippetInnerElement extends PureComponent {

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
