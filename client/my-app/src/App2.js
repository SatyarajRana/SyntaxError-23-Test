// import { set } from "mongoose";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080"); // Replace with your server URL

const App = () => {
  const [roomCode, setRoomCode] = useState();
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [hint, setHint] = useState("");
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    // Event listeners for server events

    socket.on("roomCreated", (roomCode) => {
      console.log("roomCreated");
      setRoomCode(roomCode);
    });

    socket.on("roomJoined", (roomCode) => {
      setRoomCode(roomCode);
    });

    socket.on("joinRoomFailed", () => {
      setMessage("Failed to join the room. Please try again.");
    });

    socket.on("hint", (hint) => {
      setHint(hint);
    });

    socket.on("gameWon", (playerId) => {
      if (socket.id === playerId) {
        setGameWon(true);
      } else {
        setMessage("Opponent has won!");
      }
    });

    return () => {
      // Clean up event listeners
      //   socket.off("roomCreated");
      //   socket.off("roomJoined");
      //   socket.off("joinRoomFailed");
      //   socket.off("hint");
      //   socket.off("gameWon");
    };
  }, []);

  const handleCreateRoom = () => {
    var randomNum = Math.floor(Math.random() * 9000) + 1000;

    socket.emit("createRoom", randomNum);
  };

  const handleJoinRoom = () => {
    console.log("Joining room" + joinCode);
    socket.emit("joinRoom", joinCode);
  };

  const handleGuessPlace = (event) => {
    event.preventDefault();
    const guess = event.target.elements.guess.value;
    socket.emit("guessPlace", roomCode, guess);
  };

  return (
    <div>
      {!roomCode ? (
        <div>
          <h1>Create a Room</h1>
          {/* <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          /> */}
          <button onClick={handleCreateRoom}>Create</button>
          <hr />
          <h1>Join a Room</h1>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join</button>
          <p>{message}</p>
        </div>
      ) : (
        <div>
          <h2>Room Code: {roomCode}</h2>
          {!gameWon ? (
            <form onSubmit={handleGuessPlace}>
              <input type="text" name="guess" />
              <button type="submit">Guess</button>
              {hint && <p>Hint: {hint}</p>}
              <p>{message}</p>
            </form>
          ) : (
            <h2>Congratulations! You won!</h2>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
