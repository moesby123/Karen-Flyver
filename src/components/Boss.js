import React, { useState, useEffect } from 'react';

const Boss = ({ top, left, lasers, lastLaserTime }) => {
  const [isShooting, setIsShooting] = useState(false);

  useEffect(() => {
    if (lastLaserTime) {
      setIsShooting(true);
      const timer = setTimeout(() => {
        setIsShooting(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [lastLaserTime]);

  return (
    <>
      <div 
        style={{ 
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
          width: '200px',
          height: '200px',
          backgroundImage: `url("/${isShooting ? 'bossshoot' : 'boss'}.png")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.7)) drop-shadow(0 0 40px rgba(255, 0, 0, 0.5))', // Red glow effect
          animation: 'bossGlow 2s infinite alternate', // Pulsating animation
          transition: 'background-image 0.1s ease-in-out',
        }}
      />
      {lasers.map((laser, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: `${laser.y}px`,
            left: `${laser.x}px`,
            width: `${laser.width}px`,
            height: '5px',
            backgroundColor: 'red',
            boxShadow: '0 0 10px #ff0000, 0 0 20px #ff0000',
          }}
        />
      ))}
    </>
  );
};

export default Boss;