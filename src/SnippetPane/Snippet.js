import React from 'react';
import { Pos } from 'codemirror';


import { separate } from '../File/';

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

  get descriptionMoreURL() {
    return this.props.descriptionMoreURL;
  }

  get leftLabel() {
    return this.props.leftLabelHTML || this.props.leftLabel || '';
  }

  get rightLabel() {
    return this.props.rightLabelHTML || this.props.rightLabel || '';
  }

  get plane() {
    return this._separate.plane;
  }

  get fileKey() {
    return this.props.fileKey;
  }

  render(element, self, data) {
    element.textContent = this.props.prefix + ' ' + this.props.description;
    return element;
  }

  hint(instance, self, data) {
    const from  = self.asset ? new Pos(self.from.line + 1, 0) : self.from;
    const to    = self.asset ? from : self.to;
    const text  = self.asset ? data.text + '\n' : data.text;

    instance.replaceRange(text, from, to, 'complete');

    const length = text.split('\n').length + (self.asset ? -1 : 0);
    Array.from({ length }).forEach((v, i) => instance.indentLine(i + from.line));

    return {
      from,
      to: new Pos(from.line + length - 1, 0),
    };
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
