import React from 'react';
import ReactDOM from 'react-dom';


import RootComponent from './RootComponent';
import { makeFromElements } from '../File/';

export default (props) => {

  window.addEventListener('beforeunload', (event) => {
    if (process.env.NODE_ENV === 'production') {
      event.returnValue = "Stop! You can't return later!";
      return event.returnValue;
    }
  });

  return Array.from(
    document.querySelectorAll(`.${CSS_PREFIX}app`)
  ).map(appRoot => {
    const scripts = document.querySelectorAll('script' + appRoot.getAttribute('data-target'));

    return makeFromElements(scripts)
      .then(files => {

        return ReactDOM.render(
          <RootComponent files={files} rootElement={appRoot} {...props} />,
          appRoot
        );

      });
  });
}
