import React, { Component, PropTypes } from 'react';

const Dock = ({ config, align, children, containerStyle, style }) => {

  containerStyle = Object.assign({
    position: 'absolute',
    left: config.width,
    top: config.height,
    width: 0,
    height: 0
  }, containerStyle);

  style = Object.assign({
    width: config.width,
    height: config.height
  }, style);

  return (
    <div style={containerStyle}>
      <div style={style} className={CSS_PREFIX + 'dock-' + align}>
        {children}
      </div>
    </div>
  );

};

Dock.propTypes = {
  config: PropTypes.object.isRequired,
  align: PropTypes.string.isRequired,
  containerStyle: PropTypes.any,
};

export default Dock;
