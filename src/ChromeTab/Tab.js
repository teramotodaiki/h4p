import React from 'react';


const getUniqueId = ((id) => () => 'Tab__' + ++id)(0);

export default class Tab {
  constructor(props) {
    this.props = Object.freeze(props);
    this.key = props.key || getUniqueId();
  }

  get file() {
    return this.props.getFile();
  }

  get component() {
    return this.props.component || this.file.component;
  }

  get isSelected() {
    return !!this.props.isSelected;
  }

  get label() {
    const { file } = this;
    if (file.is('markdown') && this.props.component) {
      return file.header;
    }
    return file.plane + file.ext;
  }

  is(tab) {
    if (!tab.file || !this.file) {
      return false;
    }
    return (tab.key === this.key) ||
      tab.file.key === this.file.key && tab.component === this.component;
  };

  select(isSelected) {
    const props = Object.assign({}, this.props, {
      key: this.key,
      isSelected,
    });
    return new Tab(props);
  }

  renderContent(props) {
    if (!this.file) {
      return null;
    }
    return (
      <this.component
        file={this.file}
        tab={this}
        {...props}
      />
    );
  }
}
