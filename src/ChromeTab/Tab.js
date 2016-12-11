import React from 'react';


import ChromeTabContent from './ChromeTabContent';

const getUniqueId = ((id) => () => 'Tab__' + ++id)(0);

export default class Tab {
  constructor(props) {
    this.props = Object.freeze(props);
    this.key = getUniqueId();
  }

  get file() {
    return this.props.getFile();
  }

  get component() {
    return this.props.component || this.file.component;
  }

  is(tab) {
    return tab.file === this.file && tab.component === this.component;
  }

  renderContent(props) {
    return (
      <ChromeTabContent key={this.key} show={props.isSelected}>
        <this.component file={this.file} {...props} />
      </ChromeTabContent>
    );
  }
}
