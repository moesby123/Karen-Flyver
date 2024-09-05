import React, { useState } from 'react';

const SignInAndScoreboard = ({ onSignIn, highScores }) => {
  const [playerName, setPlayerName] = useState('');
  const [showScoreboard, setShowScoreboard] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onSignIn(playerName.trim());
    }
  };

  return (
    <div className="sign-in-scoreboard">
      {!showScoreboard ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            required
          />
          <button type="submit">Play Game</button>
          <button type="button" onClick={() => setShowScoreboard(true)}>View Scoreboard</button>
        </form>
      ) : (
        <div className="scoreboard">
          <h2>High Scores</h2>
          <ul>
            {highScores.map((score, index) => (
              <li key={index}>{score.name}: {score.score}</li>
            ))}
          </ul>
          <button onClick={() => setShowScoreboard(false)}>Back to Sign In</button>
        </div>
      )}
    </div>
  );
};

export default SignInAndScoreboard;