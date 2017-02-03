import React, {Component, PropTypes} from 'react';
import {Card, CardMedia} from 'material-ui/Card';
import ReactPlayer from 'react-player';

import {commonRoot} from './commonStyles';

export default class MediaCard extends Component {

  static propTypes = {
    port: PropTypes.object
  };

  state = {
    playerState: {
      // https://github.com/CookPete/react-player#props
    }
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.port !== nextProps.port) {
      if (this.props.port) {
        this.props.port.removeEventListener('message', this.handleMessage);
      }
      if (nextProps.port) {
        nextProps.port.addEventListener('message', this.handleMessage);
      }
    }
  }

  handleMessage = (event) => {
    if (!event.data || !event.data.query)
      return;
    const {query, value} = event.data;

    // Media
    if (query === 'media') {
      this.setState({playerState: value});
    }
  };

  render() {
    if (!this.state.playerState.url) {
      return null;
    }

    return (
      <Card initiallyExpanded style={commonRoot}>
        <CardMedia>
          <ReactPlayer {...this.state.playerState}/>
        </CardMedia>
      </Card>
    );
  }
}
