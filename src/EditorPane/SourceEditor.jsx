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
      root,
      editorContainer,
    } = getStyle(this.props, this.context);

    return (
      <div style={root}>
        <div style={editorContainer}>
          <Editor {...this.props} />
        </div>
        <SnippetPane />
      </div>
    );
  }
}
