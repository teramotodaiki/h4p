import React from 'react';
import separate from './separate';


export default class Snippet {
  constructor(props) {
    this.key = getUniqueId();
    this.props = Object.freeze(props);
    this._separate = separate(props.name);
  }

  get text() {
    return this.props.body
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t');
  }

  get prefix() {
    return this.props.prefix || '';
  }

  get description() {
    return this.props.description;
  }

  get leftLabel() {
    const { leftLabel, leftLabelHTML } = this.props;
    if (!this._leftLabel) {
      if (leftLabelHTML) {
        this._leftLabel = parseElement(leftLabelHTML);
      } else {
        this._leftLabel = leftLabel || null;
      }
    }
    return this._leftLabel;
  }

  get rightLabel() {
    const { rightLabel, rightLabelHTML } = this.props;
    if (!this._rightLabel) {
      if (rightLabelHTML) {
        this._rightLabel = parseElement(rightLabelHTML);
      } else {
        this._rightLabel = rightLabel || null;
      }
    }
    return this._rightLabel;
  }

  get plane() {
    return this._separate.plane;
  }

  renderLeftLabel(findFile) {
    if (React.isValidElement(this.leftLabel) && this.leftLabel.props.src) {
      const file = findFile(this.leftLabel.props.src);
      if (file) {
        return React.cloneElement(this.leftLabel, {
          src: file.blobURL,
        });
      }
    }
    return this.leftLabel;
  }

  renderRightLabel(findFile) {
    if (React.isValidElement(this.rightLabel) && this.rightLabel.props.src) {
      const file = findFile(this.rightLabel.props.src);
      if (file) {
        return React.cloneElement(this.rightLabel, {
          src: file.blobURL,
        });
      }
    }
    return this.rightLabel;
  }

  test(tokenString) {
    const prefix = this.props.prefix.toLowerCase();
    return prefix.indexOf(tokenString.toLowerCase()) === 0;
  }

  render(element, self, data) {
    element.textContent = this.props.prefix + ' ' + this.props.description;
    return element;
  }

  hint(instance, self, data) {
    const { from, to } = self;
    instance.replaceRange(data.text, from, to, 'complete');

    const length = data.text.split('\n').length;
    Array.from({ length }).forEach((v, i) => instance.indentLine(i + self.from.line));
  }

}

const getUniqueId = ((id) => () => 'Snippet__' + ++id)(0);

const parseElement = (html) => {
  const span = document.createElement('span');
  span.innerHTML = html;
  if (span.firstChild) {
    const { tagName, attributes } = span.firstChild;
    const props = Array.from(attributes)
      .map((attr) => ({ [attr.name]: attr.value }))
      .reduce((p, c) => Object.assign(p, c), {});
    return React.createElement(tagName, props);
  }
  return null;
};
