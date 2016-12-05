export default class Snippet {
  constructor(props) {
    this.props = Object.freeze(props);
  }

  get text() {
    return this.props.body;
  }

  get displayText() {
    return this.props.name;
  }

  get className() {
    return '';
  }

  test(tokenString) {
    return this.props.prefix.indexOf(tokenString) === 0;
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
