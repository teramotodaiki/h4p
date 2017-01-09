import React from 'react';


import { SourceFile } from '../File/';

const getUniqueId = ((id) => () => 'Tab__' + ++id)(0);

export default class Tab {
  constructor(props) {
    this.props = Object.freeze(props);
    this.key = props.key || getUniqueId();
  }

  get file() {
    return this.props.getFile() || new SourceFile({
      name: 'Not Found',
      type: 'text/plane',
      text: 'File Not Found :-/',
    });
  }

  get label() {
    const { plane, ext } = this.file;
    return plane + ext;
  }

  get isSelected() {
    return !!this.props.isSelected;
  }

  is(tab) {
    if (!tab.file || !this.file) {
      return false;
    }
    return (tab.key === this.key) ||
      tab.file.key === this.file.key;
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
      <this.file.component
        file={this.file}
        tab={this}
        {...props}
      />
    );
  }
}
