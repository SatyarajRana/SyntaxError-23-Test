import React, { useState } from "react";
import { Link } from "react-router-dom";

import "../styles.css";
const HomePage = () => {
  const [userName, setUserName] = useState("");
  //   const history = useHistory(); // Initialize history

  const handleStartGame = () => {
    // Redirect to the game page with user's name as a query parameter
    // history.push(`/game?name=${encodeURIComponent(userName)}`);
    const gameLink = `/game?name=${encodeURIComponent(userName)}`;
    return <Link to={gameLink} />;
  };

  return (
    <div className="page-container">
      <div className="home-container">
        <h1>Welcome to the Quiz Game!</h1>
        <p>Please enter your name to start the game:</p>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
        />
        <button onClick={handleStartGame}>
          <Link
            to={`/game/${encodeURIComponent(userName)}`}
            className="custom-link"
          >
            Enter
          </Link>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
