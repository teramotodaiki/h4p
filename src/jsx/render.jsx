import React from 'react';
import ReactDOM from 'react-dom';

import Main from './Main';

export default ({ player, config }, rootElement) =>
  ReactDOM.render(<Main player={player} config={config} />, rootElement);
