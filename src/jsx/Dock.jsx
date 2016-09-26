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
    display: 'flex',
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: config.width,
    height: config.height
  }, style);

  return (
    <div style={containerStyle}>
      <div style={style} className={CSS_PREFIX + 'frame_container-dock_' + align}>
        {children}
      </div>
    </div>
  );

};

Dock.propTypes = {
  config: PropTypes.object.isRequired,
  align: PropTypes.string.isRequired,
  containerStyle: PropTypes.any,
  style: PropTypes.any
};

export default Dock;
