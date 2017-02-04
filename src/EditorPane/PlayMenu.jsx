import React, { PureComponent, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import AVPlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';
import { fade } from 'material-ui/utils/colorManipulator';


export default class PlayMenu extends PureComponent {

  static propTypes = {
    getFiles: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    localization: PropTypes.object.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
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
      this.props.setLocation({
        href: '',
      });
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

  renderMenu = (entry) => {
    const hrefStyle = {
      marginLeft: 8,
      fontSize: '.8rem',
      opacity: .6,
    };

    return (
      <MenuItem
        key={entry.href}
        value={entry.href}
      >
        <span>{entry.title}</span>
        <span style={hrefStyle}>{entry.href}</span>
      </MenuItem>
    );
  };

  render() {
    const {
      localization,
    } = this.props;
    const {
      palette,
    } = this.context.muiTheme;

    const styles = {
      button: {
        padding: 0,
        lineHeight: 2,
        color: palette.alternateTextColor,
        backgroundColor: palette.primary1Color,
        borderRadius: 0,
      },
      current: {
        backgroundColor: fade(palette.primary1Color, 0.1),
        marginTop: -8,
        marginBottom: -8,
      },
      currentSecondaryText: {
        marginLeft: 8,
        fontSize: '.8rem',
        opacity: .6,
      },
    };

    const current = this.state.entries
      .find((item) => item.href === this.props.href);

    return (
      <div>
        <FlatButton primary
          label={localization.editor.play}
          style={styles.button}
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
          {current && [
            <MenuItem
              key="current"
              value={current.href}
              innerDivStyle={styles.current}
              leftIcon={<NavigationRefresh />}
              primaryText={current.title}
              secondaryText={<span style={styles.currentSecondaryText}>Ctrl + Space</span>}
            />,
            <Divider key="divider" />
          ]}
          {this.state.entries.map(this.renderMenu)}
          </Menu>
        </Popover>
      </div>

    );
  }
}
