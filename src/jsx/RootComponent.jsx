import React, { Component, PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-dnd';


import Main from './Main';

class RootComponent extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    rootElement: PropTypes.object.isRequired,
  };

  render() {
    const {
      rootElement,
    } = this.props;

    const rootStyle = getComputedStyle(rootElement);
    return (
      <Main {...this.props} rootStyle={rootStyle} />
    );
  }
}


const dndBackend = 'ontouchend' in document ? TouchBackend : HTML5Backend;
export default DragDropContext(dndBackend)(RootComponent);
