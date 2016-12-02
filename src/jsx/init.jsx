import React from 'react';
import ReactDOM from 'react-dom';


import RootComponent from './RootComponent';
import { makeFromElements } from '../File/';

export default () => {

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
    const provider = ((elem) => {
      return elem ? JSON.parse(elem.getAttribute('content')) : null;
    })(document.querySelector('meta[name="feeles-provider"]'));

    return makeFromElements(scripts)
      .then(files => {

        return ReactDOM.render(
          <RootComponent files={files} provider={provider} rootElement={appRoot} />,
          appRoot
        );

      });
  });
}
