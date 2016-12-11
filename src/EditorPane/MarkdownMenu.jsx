import React, { Component, PropTypes } from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import CommunicationImportContacts from 'material-ui/svg-icons/communication/import-contacts';


import { SizerWidth } from '../Monitor/';
import { Tab } from '../ChromeTab/';
import Readme from './Readme';


const getStyle = (props, context) => {
  return {
    root: {
      position: 'absolute',
      paddingLeft: SizerWidth,
      zIndex: 1100,
    },
  };
};

export default class MarkdownMenu extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    tabs: PropTypes.array.isRequired,
    selectTab: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    open: false,
  };

  toggleMenu = (event) => {
    const { open } = this.state;

    this.setState({
      open: !open,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({ open: false });
  };

  handleChange = (event, value) => {
    const tab = new Tab({
      getFile: () => this.props.files.find((file) => file.key === value.key),
      component: Readme,
    });

    this.props.selectTab(tab);
    this.handleRequestClose();
  };

  render() {
    const {
      root,
    } = getStyle(this.props, this.context);

    const menus = this.props.files
      .filter((file) => file.is('markdown'));

    return (
      <div style={root}>
        <FloatingActionButton secondary mini
          onTouchTap={this.toggleMenu}
        >
          <CommunicationImportContacts />
        </FloatingActionButton>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
        >
          <Menu onChange={this.handleChange}>
          {menus.map((file) => (
            <MenuItem
              key={file.key}
              primaryText={file.header}
              value={file}
            />
          ))}
          </Menu>
        </Popover>
      </div>
    );
  }
}
