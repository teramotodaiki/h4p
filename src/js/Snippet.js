import classNames from 'classnames';

const HINT_ELEMENT_CLASS_SNIPPET = 'CodeMirror-hint-snippet';

export default class Snippet {
  constructor(settings) {
    Object.assign(this, settings);

    this.className = classNames(HINT_ELEMENT_CLASS_SNIPPET, this.className);
  }

  render(element, self, data) {
    element.textContent = data.displayText;
    return element;

  }

  hint(instance, self, data) {
    const { from, to } = typeof data.pick === 'function' ? data.pick(self.from) : self;
    instance.replaceRange(data.text, from, to, 'complete');

    if (typeof data.selections === 'function') {
      instance.setSelections(data.selections(self.from));
    }

    if (data.autoIndent !== false) {
      const length = data.text.split('\n').length;
      Array.from({ length }).forEach((v, i) => instance.indentLine(i + self.from.line));
    }
  }

}
