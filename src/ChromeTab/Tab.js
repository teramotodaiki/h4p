import React from 'react';


import ChromeTabContent from './ChromeTabContent';

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

  is(tab) {
    return tab.file === this.file && tab.component === this.component;
  }

  select(isSelected) {
    const props = Object.assign({}, this.props, {
      key: this.key,
      isSelected,
    });
    return new Tab(props);
  }

  renderContent(props) {
    return (
      <ChromeTabContent key={this.key} show={this.isSelected}>
        <this.component file={this.file} {...props} />
      </ChromeTabContent>
    );
  }
}
