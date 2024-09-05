import React from 'react';

const Pipe = ({ top, height, left, isRotated }) => (
  <div
    style={{
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: '50px',
      height: `${height}px`,
      backgroundImage: 'url("/pipe.jpg")',
      backgroundSize: 'cover',
      transform: isRotated ? 'rotate(180deg)' : 'none',
      boxShadow: '0 0 0 2px black', // Added black outline
    }}
  />
);

export default Pipe;