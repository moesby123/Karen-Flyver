import React, { useState, useEffect, useCallback, useRef } from 'react';
import Bird from './Bird';
import Pipe from './Pipe';
import Ball from './Ball';
import Boss from './Boss';
import SignInAndScoreboard from './SignInAndScoreboard';

const GRAVITY = 0.1;
const JUMP_VELOCITY = -4;
const PIPE_WIDTH = 50;
const PIPE_GAP = 350;
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 500;
const MIN_EDGE_GAP = 200;
const BLUE_BALL_POINTS = 5;
const PIPE_SPEED = 3;
const BIRD_WIDTH = 80;
const BIRD_HEIGHT = 80;
const BOSS_SPEED = 2;
const LASER_SPEED = 10;
const LASER_INTERVAL = 1500;
const BOSS_DURATION = 30000;
const BIRD_ACCELERATION = 0.2;
const BIRD_DECELERATION = 0.1;
const MAX_BIRD_SPEED = 4;
const BALL_SPEED = 6;

const Game = () => {
  const [gameState, setGameState] = useState({
    birdPosition: 250,
    birdHorizontalPosition: 150,
    birdVelocity: 0,
    pipeHeight: 200,
    pipePosition: GAME_WIDTH,
    balls: [],
    score: 0,
    bossActive: false,
    bossPosition: GAME_HEIGHT / 2,
    bossDirection: 1,
    bossX: GAME_WIDTH,
    lasers: [],
    lastLaserTime: 0,
    bossStartTime: null,
    birdHorizontalVelocity: 0,
    isMovingLeft: false,
    isMovingRight: false,
    lastBossSpawnScore: 0,
  });
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef();
  const blueBallSoundRef = useRef(null);
  const redBallSoundRef = useRef(null);
  const laserSoundRef = useRef(null);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || '');
  const [highScores, setHighScores] = useState([]);
  const [showSignIn, setShowSignIn] = useState(!playerName);

  useEffect(() => {
    const savedHighScores = JSON.parse(localStorage.getItem('highScores')) || [];
    setHighScores(savedHighScores);
  }, []);

  const updateHighScores = useCallback((newScore) => {
    setHighScores(prevScores => {
      const playerIndex = prevScores.findIndex(score => score.name === playerName);
      let updatedScores;
      
      if (playerIndex !== -1) {
        if (newScore > prevScores[playerIndex].score) {
          updatedScores = [
            ...prevScores.slice(0, playerIndex),
            { name: playerName, score: newScore },
            ...prevScores.slice(playerIndex + 1)
          ];
        } else {
          return prevScores;
        }
      } else {
        updatedScores = [...prevScores, { name: playerName, score: newScore }];
      }
      
      updatedScores.sort((a, b) => b.score - a.score);
      updatedScores = updatedScores.slice(0, 10);
      
      localStorage.setItem('highScores', JSON.stringify(updatedScores));
      return updatedScores;
    });
  }, [playerName]);

  const handleSignIn = (name) => {
    setPlayerName(name);
    localStorage.setItem('playerName', name);
    setShowSignIn(false);
  };

  const jump = useCallback(() => {
    if (gameStarted) {
      setGameState(prevState => ({
        ...prevState,
        birdVelocity: JUMP_VELOCITY,
      }));
    }
  }, [gameStarted]);

  const moveBird = useCallback((direction) => {
    if (gameStarted) {
      setGameState(prevState => ({
        ...prevState,
        isMovingLeft: direction === -1,
        isMovingRight: direction === 1,
      }));
    }
  }, [gameStarted]);

  const stopBirdHorizontalMovement = useCallback(() => {
    if (gameStarted) {
      setGameState(prevState => ({
        ...prevState,
        isMovingLeft: false,
        isMovingRight: false,
      }));
    }
  }, [gameStarted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        moveBird(-1);
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        moveBird(1);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        stopBirdHorizontalMovement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump, moveBird, stopBirdHorizontalMovement]);

  useEffect(() => {
    blueBallSoundRef.current = new Audio();
    const blueAudioSource = document.createElement('source');
    blueAudioSource.src = '/blueball.ogg';
    blueAudioSource.type = 'audio/ogg';
    blueBallSoundRef.current.appendChild(blueAudioSource);
    
    const blueFallbackSource = document.createElement('source');
    blueFallbackSource.src = '/blueball.mp3';
    blueFallbackSource.type = 'audio/mpeg';
    blueBallSoundRef.current.appendChild(blueFallbackSource);

    blueBallSoundRef.current.load();

    redBallSoundRef.current = new Audio('/redball.mp3');
    redBallSoundRef.current.load();

    laserSoundRef.current = new Audio('/lazer.mp3');
    laserSoundRef.current.volume = 0.3;
    laserSoundRef.current.load();
  }, []);

  const playBlueBallSound = useCallback(() => {
    if (blueBallSoundRef.current) {
      blueBallSoundRef.current.currentTime = 0;
      blueBallSoundRef.current.play().catch(e => {
        console.error("Error playing sound:", e);
        console.error("Error name:", e.name);
        console.error("Error message:", e.message);
      });
    } else {
      console.error("Blue ball sound not initialized");
    }
  }, []);

  const playRedBallSound = useCallback(() => {
    if (redBallSoundRef.current) {
      redBallSoundRef.current.currentTime = 0;
      redBallSoundRef.current.play().catch(e => {
        console.error("Error playing red ball sound:", e);
      });
    } else {
      console.error("Red ball sound not initialized");
    }
  }, []);

  const playLaserSound = useCallback(() => {
    if (laserSoundRef.current) {
      laserSoundRef.current.currentTime = 0;
      laserSoundRef.current.play().catch(e => {
        console.error("Error playing laser sound:", e);
      });
    } else {
      console.error("Laser sound not initialized");
    }
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameState(prevState => ({
      ...prevState,
      birdPosition: 250,
      birdHorizontalPosition: 150,
      birdVelocity: 0,
      pipePosition: GAME_WIDTH,
      balls: [],
      score: 0,
      bossActive: false,
      bossPosition: GAME_HEIGHT / 2,
      bossDirection: 1,
      bossX: GAME_WIDTH,
      lasers: [],
      lastLaserTime: 0,
      bossStartTime: null,
      birdHorizontalVelocity: 0,
      isMovingLeft: false,
      isMovingRight: false,
      lastBossSpawnScore: 0,
    }));
  
    if (blueBallSoundRef.current) {
      blueBallSoundRef.current.play().then(() => {
        blueBallSoundRef.current.pause();
        blueBallSoundRef.current.currentTime = 0;
      }).catch(e => console.error("Error enabling audio:", e));
    }
  }, []);

  const updateGameState = useCallback(() => {
    setGameState(prevState => {
      let gameOver = false;

      const newBirdPosition = Math.max(0, Math.min(prevState.birdPosition + prevState.birdVelocity, GAME_HEIGHT - BIRD_HEIGHT));
      const newBirdVelocity = prevState.birdVelocity + GRAVITY;
      let newPipePosition = prevState.pipePosition - PIPE_SPEED;
      let newPipeHeight = prevState.pipeHeight;
      let newScore = prevState.score;
      let newBalls = prevState.balls;
      let newBossActive = prevState.bossActive;
      let newBossPosition = prevState.bossPosition;
      let newBossDirection = prevState.bossDirection;
      let newBossX = prevState.bossX;
      let newLasers = prevState.lasers;
      let newBossStartTime = prevState.bossStartTime;
      const currentTime = Date.now();

      const birdRect = {
        left: prevState.birdHorizontalPosition,
        right: prevState.birdHorizontalPosition + BIRD_WIDTH,
        top: newBirdPosition,
        bottom: newBirdPosition + BIRD_HEIGHT,
      };

      console.log(`Current score: ${newScore}, Boss active: ${newBossActive}, Last boss spawn: ${prevState.lastBossSpawnScore || 0}`); // Debug log

      // Check if it's time to spawn a boss
      if (!newBossActive && newScore >= 50 && (newScore - (prevState.lastBossSpawnScore || 0) >= 50)) {
        console.log('Activating boss!'); // Debug log
        newBossActive = true;
        newBalls = [];
        newPipePosition = GAME_WIDTH;
        newBossX = GAME_WIDTH + 200;
        newBossStartTime = Date.now();
      }

      if (newBossActive) {
        const bossElapsedTime = Date.now() - newBossStartTime;
        if (bossElapsedTime >= BOSS_DURATION) {
          console.log('Boss fight ended'); // Debug log
          newBossActive = false;
          newBossX = GAME_WIDTH;
          newLasers = [];
          return {
            ...prevState,
            score: newScore,
            bossActive: false,
            lastBossSpawnScore: newScore,
            bossX: GAME_WIDTH,
            lasers: [],
          };
        } else {
          if (newBossX > GAME_WIDTH - 200) {
            newBossX -= 2;
          } else {
            newBossPosition += BOSS_SPEED * newBossDirection;
            if (newBossPosition <= 0 || newBossPosition >= GAME_HEIGHT - 200) {
              newBossDirection *= -1;
            }
          }

          if (currentTime - prevState.lastLaserTime > LASER_INTERVAL) {
            newLasers.push({
              x: newBossX,
              y: newBossPosition + 100,
              width: 0,
            });
            prevState.lastLaserTime = currentTime;
            playLaserSound();
          }

          newLasers = newLasers.map(laser => ({
            ...laser,
            x: laser.x - LASER_SPEED,
            width: Math.min(laser.width + LASER_SPEED, 300),
          })).filter(laser => laser.x + laser.width > 0);

          const hitLaser = newLasers.some(laser => 
            birdRect.left < laser.x + laser.width &&
            birdRect.right > laser.x &&
            birdRect.top < laser.y + 5 &&
            birdRect.bottom > laser.y
          );

          if (hitLaser) {
            gameOver = true;
          }
        }
      } else {
        if (newPipePosition <= -PIPE_WIDTH) {
          newPipePosition = GAME_WIDTH;
          newPipeHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 2 * MIN_EDGE_GAP) + MIN_EDGE_GAP;
          newScore += 1;
        }

        newBalls = newBalls
          .map(ball => {
            const ballSize = ball.color === 'blue' ? 120 : 80;
            let newTop = ball.top + Math.sin(ball.left * 0.03) * 4;
            
            newTop = Math.max(0, Math.min(newTop, GAME_HEIGHT - ballSize));

            return {
              ...ball,
              left: ball.left - BALL_SPEED,
              top: newTop,
            };
          })
          .filter(ball => {
            const ballSize = ball.color === 'blue' ? 120 : 80;
            const ballRect = {
              left: ball.left,
              right: ball.left + ballSize,
              top: ball.top,
              bottom: ball.top + ballSize,
            };
            const collision = (
              birdRect.left < ballRect.right &&
              birdRect.right > ballRect.left &&
              birdRect.top < ballRect.bottom &&
              birdRect.bottom > ballRect.top
            );
            if (collision) {
              if (ball.color === 'blue') {
                newScore += BLUE_BALL_POINTS;
                playBlueBallSound();
                return false;
              } else if (ball.color === 'red') {
                newScore = Math.max(0, newScore - 1);
                playRedBallSound();
                return false;
              }
            }
            return !collision;
          });

        if (Math.random() < 0.003) {
          const ballSize = Math.random() < 0.5 ? 120 : 80;
          newBalls.push({
            top: Math.random() * (GAME_HEIGHT - ballSize),
            left: GAME_WIDTH,
            color: ballSize === 120 ? 'blue' : 'red',
          });
        }
      }

      const hitEdge = newBirdPosition <= 0 || newBirdPosition + BIRD_HEIGHT >= GAME_HEIGHT;

      if (hitEdge) {
        gameOver = true;
      }

      if (newBossActive) {
        const bossRect = {
          left: newBossX,
          right: newBossX + 200,
          top: newBossPosition,
          bottom: newBossPosition + 200,
        };

        if (
          birdRect.right > bossRect.left &&
          birdRect.left < bossRect.right &&
          birdRect.bottom > bossRect.top &&
          birdRect.top < bossRect.bottom
        ) {
          gameOver = true;
        }
      } else {
        const hitPipe = (
          birdRect.right > newPipePosition &&
          birdRect.left < newPipePosition + PIPE_WIDTH &&
          (birdRect.top < newPipeHeight || birdRect.bottom > newPipeHeight + PIPE_GAP)
        );

        if (hitPipe) {
          gameOver = true;
        }
      }

      let newBirdHorizontalPosition = prevState.birdHorizontalPosition;
      let newBirdHorizontalVelocity = prevState.birdHorizontalVelocity;

      if (prevState.isMovingLeft) {
        newBirdHorizontalVelocity = Math.max(newBirdHorizontalVelocity - BIRD_ACCELERATION, -MAX_BIRD_SPEED);
      } else if (prevState.isMovingRight) {
        newBirdHorizontalVelocity = Math.min(newBirdHorizontalVelocity + BIRD_ACCELERATION, MAX_BIRD_SPEED);
      } else {
        if (newBirdHorizontalVelocity > 0) {
          newBirdHorizontalVelocity = Math.max(0, newBirdHorizontalVelocity - BIRD_DECELERATION);
        } else if (newBirdHorizontalVelocity < 0) {
          newBirdHorizontalVelocity = Math.min(0, newBirdHorizontalVelocity + BIRD_DECELERATION);
        }
      }

      newBirdHorizontalPosition += newBirdHorizontalVelocity;

      newBirdHorizontalPosition = Math.max(
        0,
        Math.min(newBirdHorizontalPosition, GAME_WIDTH - BIRD_WIDTH)
      );

      if (gameOver) {
        setGameStarted(false);
        updateHighScores(newScore);
        return {
          birdPosition: 250,
          birdHorizontalPosition: 150,
          birdVelocity: 0,
          pipePosition: GAME_WIDTH,
          pipeHeight: 200,
          balls: [],
          score: 0,
          bossActive: false,
          bossPosition: GAME_HEIGHT / 2,
          bossDirection: 1,
          bossX: GAME_WIDTH,
          lasers: [],
          lastLaserTime: 0,
          bossStartTime: null,
          birdHorizontalVelocity: 0,
          isMovingLeft: false,
          isMovingRight: false,
          lastBossSpawnScore: 0,
        };
      }

      return {
        birdPosition: newBirdPosition,
        birdHorizontalPosition: newBirdHorizontalPosition,
        birdVelocity: newBirdVelocity,
        pipePosition: newPipePosition,
        pipeHeight: newPipeHeight,
        balls: newBalls,
        score: newScore,
        bossActive: newBossActive,
        bossPosition: newBossPosition,
        bossDirection: newBossDirection,
        bossX: newBossX,
        lasers: newLasers,
        lastLaserTime: prevState.lastLaserTime,
        bossStartTime: newBossStartTime,
        birdHorizontalVelocity: newBirdHorizontalVelocity,
        isMovingLeft: prevState.isMovingLeft,
        isMovingRight: prevState.isMovingRight,
        lastBossSpawnScore: newBossActive ? prevState.lastBossSpawnScore : (prevState.lastBossSpawnScore || 0),
      };
    });
  }, [playBlueBallSound, playRedBallSound, playLaserSound, updateHighScores]);

  useEffect(() => {
    if (gameStarted) {
      gameLoopRef.current = requestAnimationFrame(function gameLoop() {
        updateGameState();
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      });
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, updateGameState]);

  const Instructions = () => (
    <div style={{
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '250px',
    }}>
      <h3>Sådan spiller du</h3>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Tryk på mellemrum for at hoppe</li>
        <li>Brug venstre/højre piletaster for at bevæge dig vandret</li>
        <li>Undgå rør og Katte</li>
        <li>Saml Høns for at få point</li>
        <li>Overlev boss-kampen!</li>
      </ul>
    </div>
  );

  const Scoreboard = () => (
    <div style={{
      position: 'absolute',
      right: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '250px',
    }}>
      <h3>High Scores</h3>
      <ol style={{ paddingLeft: '20px' }}>
        {highScores.slice(0, 5).map((score, index) => (
          <li key={index}>{score.name}: {score.score}</li>
        ))}
      </ol>
    </div>
  );

  return (
    <div className="game-container" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <h2 style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 10 }}>Karen Flyver</h2>
      {showSignIn ? (
        <SignInAndScoreboard onSignIn={handleSignIn} highScores={highScores} />
      ) : (
        <div className="game" onClick={jump} style={{ width: GAME_WIDTH, height: GAME_HEIGHT, position: 'relative', margin: '0 auto' }}>
          {!gameStarted && (
            <button
              onClick={startGame}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '24px',
                padding: '10px 20px',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              Start Spil
            </button>
          )}
          <Bird top={gameState.birdPosition} left={gameState.birdHorizontalPosition} />
          {gameStarted && !gameState.bossActive && (
            <>
              <Pipe top={0} height={gameState.pipeHeight} left={gameState.pipePosition} isRotated={true} />
              <Pipe top={gameState.pipeHeight + PIPE_GAP} height={GAME_HEIGHT - gameState.pipeHeight - PIPE_GAP} left={gameState.pipePosition} isRotated={false} />
              {gameState.balls.map((ball, index) => (
                <Ball key={index} top={ball.top} left={ball.left} color={ball.color} />
              ))}
            </>
          )}
          {gameStarted && gameState.bossActive && (
            <Boss top={gameState.bossPosition} left={gameState.bossX} lasers={gameState.lasers} lastLaserTime={gameState.lastLaserTime} />
          )}
        </div>
      )}
      <div 
        style={{ 
          position: 'absolute', 
          right: '20px', 
          top: '20px', 
          textAlign: 'right', 
          fontSize: '24px', 
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <div>Player: {playerName}</div>
        <div>Score: {gameState.score}</div>
        <div>Next Boss: {Math.ceil(gameState.score / 50) * 50}</div>
      </div>
      <Instructions />
      <Scoreboard />
    </div>
  );
};

export default Game;