import React, { Component, PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';


import Main from './Main';

class RootComponent extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
  };

  render() {
    return (
      <Main {...this.props} />
    );
  }
}

export default DragDropContext(HTML5Backend)(RootComponent);
