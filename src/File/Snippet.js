export default class Snippet {
  constructor(props) {
    this.key = getUniqueId();
    this.props = Object.freeze(props);
  }

  get text() {
    return this.props.body;
  }

  get prefix() {
    return this.props.prefix;
  }

  get leftLabel() {
    return this.props.leftLabel;
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
