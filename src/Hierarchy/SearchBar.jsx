import React, { Component, PropTypes } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Paper from 'material-ui/Paper';
import ActionSearch from 'material-ui/svg-icons/action/search';


import TrashBox from './TrashBox';
import search, { getOptions } from './search';
import DesktopFile from './DesktopFile';

const getStyles = (props, context, state) => {
  const {
    palette,
    spacing,
    prepareStyles,
  } = context.muiTheme;
  const { focus } = state;

  return {
    root: prepareStyles({
      display: 'flex',
      alignItems: 'center',
      position: 'absolute',
      boxSizing: 'border-box',
      width: '100%',
      height: 40,
      top: spacing.desktopGutterMini,
      paddingRight: spacing.desktopGutterMini,
      paddingLeft: spacing.desktopGutterMini,
      zIndex: 100,
    }),
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
    updateFile: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    focus: false,
    showTrashes: false,
    query: '',
  };

  componentDidMount() {
    this.handleUpdate('');
  }

  handleUpdate = (query) => {
    const { filterRef } = this.props;
    const { showTrashes } = this.state;

    const options = getOptions(query);
    filterRef((file) => search(file, query, options));

    this.setState({
      query,
      showTrashes: options.showTrashes
    });
  }

  handleTrashBoxTap = () => {
    const { query, showTrashes } = this.state;

    if (!showTrashes) {
      this.handleUpdate(':trash ' + query);
    } else {
      this.handleUpdate(query.replace(/(^|\s)\:trash(\s|$)/g, '$1'));
    }
  };

  render() {
    const { updateFile, onOpen, openFileDialog } = this.props;
    const { showTrashes, query } = this.state;
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
        <TrashBox
          showTrashes={showTrashes}
          updateFile={updateFile}
          onTouchTap={this.handleTrashBoxTap}
        />
        <DesktopFile
          onOpen={onOpen}
          openFileDialog={openFileDialog}
        />
        <Paper zDepth={3} style={bar}>
          <ActionSearch style={icon} color={secondaryTextColor} />
          <AutoComplete id="search"
            searchText={query}
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
