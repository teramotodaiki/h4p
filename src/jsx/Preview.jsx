import React from 'react';
import { transparent, faintBlack, darkBlack } from 'material-ui/styles/colors';

export default (props) => {
  const { name, type, blob, blobURL } = props.file;
  const { width, height } = props.containerStyle;

  const containerStyle = {
    boxSizing: 'border-box',
    borderWidth: '1px 0 0 1px',
    borderStyle: 'solid',
    borderColor: faintBlack,
    width,
    height,
  };

  const backgroundStyle = {
    position: 'absolute',
    background: `linear-gradient(${transparent}, ${darkBlack})`,
    width: '100%',
    height: '100%',
  };

  const style = {
    position: 'absolute',
    background: `url(${blobURL}) no-repeat center/contain`,
    width: '100%',
    height: '100%',
  };

  return (
    <div style={containerStyle}>
      <div style={backgroundStyle}></div>
      <div style={style}></div>
    </div>
  );

};
