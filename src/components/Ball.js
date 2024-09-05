import React from 'react';

const Ball = ({ top, left, color }) => {
  const size = color === 'blue' ? 120 : 80;
  const glowColor = color === 'blue' ? 'lime' : '#ff4444';

  return (
    <div
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url("/${color}ball.png")`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        filter: `drop-shadow(0 0 15px ${glowColor}) drop-shadow(0 0 5px ${glowColor})`,
        animation: `glow${color.charAt(0).toUpperCase() + color.slice(1)} 1.5s ease-in-out infinite alternate`,
      }}
    />
  );
};

export default Ball;