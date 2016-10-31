import React, { Component, PropTypes } from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';

export default class MagicShot extends Component {

  static propTypes = {
    onShot: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
  }

  shot = () => {
    const { onShot } = this.props;
    onShot('alert("hello!")');
  };

  render() {
    return (
      <div>
        <FloatingActionButton
          onTouchTap={this.shot}
        />
      </div>
    );
  }
}
