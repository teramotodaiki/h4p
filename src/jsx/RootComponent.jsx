import React, { Component, PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-dnd';
import { grey100, grey500 } from 'material-ui/styles/colors';


import Main from './Main';

class RootComponent extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    rootElement: PropTypes.object.isRequired,
    inlineScriptId: PropTypes.string,
  };

  state = {
    files: [],
  };

  componentWillMount() {
    (async () => {
      for (const promise of this.props.files) {

        const file = await promise;

        this.setState({
          files: this.state.files.concat(file),
        });

        await this.wait();

      }
    })();
  }

  async wait() {
    if (Math.random() < 0.1) {
      await new Promise((resolve, reject) => {
        requestAnimationFrame(resolve);
      });
    }
  }

  renderLoading = () => {
    const styles = {
      root: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: grey100,
        fontFamily: 'cursive',
      },
      header: {
        fontWeight: 100,
        color: 'white',
      },
      count: {
        fontSize: '.5rem',
        color: grey500,
      },
    };

    return (
      <div style={styles.root}>
        <h1 style={styles.header}>Feeles</h1>
        <span style={styles.count}>{this.state.files.length}/{this.props.files.length}</span>
      </div>
    );
  };

  render() {
    if (this.props.files.length > this.state.files.length) {
      return this.renderLoading();
    }

    const {
      rootElement,
    } = this.props;

    return (
      <Main
        files={this.state.files}
        rootElement={rootElement}
        rootStyle={getComputedStyle(rootElement)}
      />
    );
  }
}


const dndBackend = 'ontouchend' in document ? TouchBackend : HTML5Backend;
export default DragDropContext(dndBackend)(RootComponent);
