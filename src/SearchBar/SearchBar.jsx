import React, { Component, PropTypes } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Paper from 'material-ui/Paper';
import ActionSearch from 'material-ui/svg-icons/action/search';


import { search } from './filters';

const getStyles = (props, context, state) => {
  const {
    palette,
    spacing,
  } = context.muiTheme;
  const { focus } = state;

  return {
    root: {
      position: 'absolute',
      boxSizing: 'border-box',
      width: '100%',
      top: spacing.desktopGutterMini,
      paddingRight: spacing.desktopGutterMini,
      paddingLeft: spacing.desktopGutterMini,
      zIndex: 100,
    },
    bar: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: 40,
      paddingRight: spacing.desktopGutterLess,
      paddingLeft: spacing.desktopGutterMini,
      backgroundColor: palette.canvasColor,
      opacity: focus ? 1 : 0.9,
    },
    icon: {
      marginTop: 4,
      marginRight: focus ? 8 : 0,
    }
  };
};

export default class SearchBar extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    filterRef: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    focus: false,
  };

  handleUpdate = (value) => {
    this.props.filterRef(search(value));
  }

  render() {
    const {
      secondaryTextColor,
    } = this.context.muiTheme.palette;
    const fileNames = this.props.files
      .map(f => f.moduleName)
      .filter(s => s);

    const {
      root,
      bar,
      icon,
    } = getStyles(this.props, this.context, this.state);

    return (
      <div style={root}>
        <Paper zDepth={3} style={bar}>
          <ActionSearch style={icon} color={secondaryTextColor} />
          <AutoComplete id="search"
            dataSource={fileNames}
            maxSearchResults={5}
            onNewRequest={this.handleUpdate}
            onUpdateInput={this.handleUpdate}
            onFocus={() => this.setState({ focus: true })}
            onBlur={() => this.setState({ focus: false })}
            fullWidth
          />
        </Paper>
      </div>
    );
  }
}
