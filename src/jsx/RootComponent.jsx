import React, { Component, PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
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

export default DragDropContext(HTML5Backend)(RootComponent);
