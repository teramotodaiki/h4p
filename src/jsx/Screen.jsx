import React, { PropTypes } from 'react';

const Screen = ({ display, frameRef }) => {

  const style = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(gray, black)',
    display: display ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const frameStyle = {
    border: '0 none',
    flex: '0 0 auto'
  };

  return (
    <div style={style}>
      <iframe
        style={frameStyle}
        ref={frameRef}
      ></iframe>
    </div>
  );

};

export default Screen;
