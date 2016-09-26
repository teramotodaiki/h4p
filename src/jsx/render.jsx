import React from 'react';
import ReactDOM from 'react-dom';

import Main from './Main';

export default (player, config) =>
  ReactDOM.render(<Main player={player} config={config} />, config.rootElement);
