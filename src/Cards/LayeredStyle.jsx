import React, { Component, PropTypes } from 'react';


export default function LayeredStyle(props) {

  if (isEmpty(props.styles)) {
    return (
      <div {...props}>
      {props.children}
      </div>
    );
  }

  const styles = [props.style].concat(props.styles)
    .filter(s => s);

  const nextProps = Object.assign({}, props, {
    style: styles[1],
    styles: styles.slice(2)
  });
  if (isEmpty(nextProps.styles)) {
    delete nextProps.styles;
  }

  return (
    <div style={styles[0]}>
      <LayeredStyle {...nextProps} />
    </div>
  );

}

function isEmpty(array) {
  return !array || !array.length;
}
