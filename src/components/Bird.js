import React from 'react';

const Bird = ({ top, left }) => (
  <div 
    style={{ 
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: '80px',
      height: '80px',
      backgroundImage: 'url("/bird.png")',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      filter: 'drop-shadow(0 0 10px white)',
      animation: 'glow 1.5s ease-in-out infinite alternate',
    }}
  />
);

export default Bird;