import React, { Component, PropTypes } from 'react';


import Editor from './Editor';
import SnippetPane from './SnippetPane';
import { SizerWidth } from '../Monitor/';

const getStyle = (props, context) => {
  const {
    palette,
  } = context.muiTheme;

  return {
    root: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    editorContainer: {
      flex: '1 1 auto',
      position: 'relative',
    },
  };
};

export default class SourceEditor extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    getFiles: PropTypes.func.isRequired,
    gutterMarginWidth: PropTypes.number,
    handleRun: PropTypes.func.isRequired,
    closeSelectedTab: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
    getConfig: PropTypes.func.isRequired,
  };

  static defaultProps = {
    gutterMarginWidth: SizerWidth,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const {
      getConfig,
    } = this.props;

    const {
      root,
      editorContainer,
    } = getStyle(this.props, this.context);

    const snippets = getConfig('snippets')['.source.js'];

    const props = Object.assign({}, this.props, {
      codemirrorRef: (ref) => (this.codemirror = ref),
    });

    return (
      <div style={root}>
        <div style={editorContainer}>
          <Editor {...props} />
        </div>
        <SnippetPane
          snippets={snippets}
        />
      </div>
    );
  }
}
