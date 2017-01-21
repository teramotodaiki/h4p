import React, { PureComponent, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import AVPlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';


export default class PlayMenu extends PureComponent {

  static propTypes = {
    getFiles: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    localization: PropTypes.object.isRequired,
  };

  state = {
    open: false,
    anchorEl: null,
    // [...{ title, href(name) }]
    entries: [],
  };

  handlePlay = (event) => {
    const files = this.props.getFiles()
      .filter((file) => file.is('html'));

    if (files.length === 0) {
      return;
    }
    if (files.length === 1) {
      this.props.setLocation({
        href: files[0].name,
      });
      return;
    }

    const parser = new DOMParser();
    const entries = files
      .map((file) => {
        const doc = parser.parseFromString(file.text, 'text/html');
        const titleNode = doc.querySelector('title');
        const title = titleNode && titleNode.textContent;
        return {
          title: title || file.name,
          href: file.name,
        };
      })
      .sort((a, b) => a.title > b.title ? 1 : -1);

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
      entries,
    });
  };

  handleItemTouchTap = (event, menuItem, index) => {
    this.props.setLocation({
      href: this.state.entries[index].href,
    });
    this.setState({
      open: false,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const {
      localization,
    } = this.props;

    const styles = {
      button: {
        padding: 0,
        height: '1.6rem',
        lineHeight: '1.6rem',
      },
      label: {
        fontSize: '.5rem',
      },
    };

    return (
      <div>
        <FlatButton
          label={localization.editor.play}
          style={styles.button}
          labelStyle={styles.label}
          icon={<AVPlayCircleOutline />}
          onTouchTap={this.handlePlay}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
        >
          <Menu
            value={this.state.href}
            onItemTouchTap={this.handleItemTouchTap}
          >
          {this.state.entries.map((item) => (
            <MenuItem
              key={item.href}
              primaryText={item.title}
              value={item.href}
            />
          ))}
          </Menu>
        </Popover>
      </div>

    );
  }
}
