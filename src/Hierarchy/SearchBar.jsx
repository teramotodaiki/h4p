import React, { Component, PropTypes } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Paper from 'material-ui/Paper';
import ActionSearch from 'material-ui/svg-icons/action/search';
import RaisedButton from 'material-ui/RaisedButton';
import ActionDeleteForever from 'material-ui/svg-icons/action/delete-forever';


import TrashBox from './TrashBox';
import search, { getOptions } from './search';
import DesktopFile from './DesktopFile';

const SearchBarHeight = 40;

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
      height: SearchBarHeight,
      top: spacing.desktopGutterMini,
      paddingRight: spacing.desktopGutterMini,
      paddingLeft: spacing.desktopGutterMini,
      zIndex: 100,
    }),
    bar: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: SearchBarHeight,
      paddingRight: spacing.desktopGutterLess,
      paddingLeft: spacing.desktopGutterMini,
      backgroundColor: palette.canvasColor,
      opacity: focus ? 1 : 0.9,
    },
    icon: {
      marginTop: 4,
      marginRight: focus ? 8 : 0,
    },
    empty: {
      flex: '1 0 auto',
      height: SearchBarHeight,
      marginLeft: spacing.desktopGutterMini,
    },
  };
};

export default class SearchBar extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    filterRef: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    deleteAll: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
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
    const {
      putFile,
      onOpen,
      openFileDialog,
      deleteAll,
    } = this.props;
    const { showTrashes, query } = this.state;
    const {
      secondaryTextColor,
      alternateTextColor,
    } = this.context.muiTheme.palette;
    const fileNames = this.props.files
      .map(f => f.moduleName)
      .filter(s => s);

    const {
      root,
      bar,
      icon,
      empty,
    } = getStyles(this.props, this.context, this.state);

    const { hierarchy } = this.props.localization;

    return (
      <div style={root}>
        <TrashBox
          showTrashes={showTrashes}
          putFile={putFile}
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
        {showTrashes ? (
          <RaisedButton secondary
            label={hierarchy.emptyTrashBox}
            icon={<ActionDeleteForever color={alternateTextColor} />}
            style={empty}
            onTouchTap={deleteAll}
          />
        ) : null}
      </div>
    );
  }
}
