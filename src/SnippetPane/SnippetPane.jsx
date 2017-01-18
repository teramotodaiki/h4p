import React, { PureComponent, PropTypes } from 'react';
import Popover from 'material-ui/Popover';


import SnippetButton from './SnippetButton';

export default class SnippetPane extends PureComponent {

  static propTypes = {
    snippets: PropTypes.array.isRequired,
    fileKey: PropTypes.string.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  state = {
    open: false,
    anchorEl: null,
    shownNode: null,
  };

  handleSelectSnippet = (event, node) => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
      shownNode: node,
    });
  };

  render() {
    const styles = {
      root: {
        maxHeight: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        boxSizing: 'border-box',
        justifyContent: 'flex-start',
      },
      popover: {
        width: 400,
        height: 200,
      },
    };

    return (
      <div style={styles.root}>
      {this.props.snippets
        .filter((snippet) => snippet.fileKey === this.props.fileKey)
        .map((snippet) => (
          <SnippetButton
            key={snippet.key}
            snippet={snippet}
            findFile={this.props.findFile}
            onSelect={this.handleSelectSnippet}
            localization={this.props.localization}
          />
        )
      )}
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          onRequestClose={() => this.setState({ open: false })}
          style={styles.popover}
        >{this.state.shownNode}</Popover>
      </div>
    );
  }
}
