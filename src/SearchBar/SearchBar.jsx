import React, { Component, PropTypes } from 'react';
import AutoComplete from 'material-ui/AutoComplete';


import { search } from './filters';

const getStyles = (props, context) => {
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;

  return {
    root: prepareStyles({
      padding: spacing.desktopGutterLess,
    }),
    bar: {
      backgroundColor: palette.canvasColor,
    },
  };
};

export default class SearchBar extends Component {

  static propTypes = {
    filterRef: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  handleUpdate = (value) => {
    this.props.filterRef(search(value));
  }

  render() {

    const {
      root,
      bar,
    } = getStyles(this.props, this.context);

    return (
      <div style={root}>
        <AutoComplete id="search"
          dataSource={[]}
          style={bar}
          onNewRequest={this.handleUpdate}
          onUpdateInput={this.handleUpdate}
          fullWidth
        />
      </div>
    );
  }
}
