import React from 'react';
import ReactDOM from 'react-dom';

import RootComponent from './RootComponent';

export default ({ config }, rootElement) =>
  ReactDOM.render(<RootComponent {...config} />, rootElement);
