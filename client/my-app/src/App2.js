import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./styles.css";

const socket = io("http://localhost:8080"); // Replace with your server URL

const App = () => {
  const [roomCode, setRoomCode] = useState();
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [message2, setMessage2] = useState("");
  const [hints, setHint] = useState([]);
  const [hintsDisplay, setHintsDisplay] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [room, setRoom] = useState({
    creator: "",
    guessers: [],
    place: "",
    winner: "",
  });

  useEffect(() => {
    // Event listeners for server events

    socket.on("roomCreated", (roomCode) => {
      console.log("roomCreated");
      setRoomCode(roomCode);
    });

    socket.on("roomJoined", (roomCode) => {
      setMessage("");
      setRoomCode(roomCode);
    });

    socket.on("joinRoomFailed", () => {
      setMessage("Failed to join the room. Please try again.");
    });

    socket.on("gameStarted", (room) => {
      console.log(`Game started in the room ${room.place}`);
      setGameStarted(true);
    });

    socket.on("updateRooms", (updatedRoom) => {
      setRoom({
        creator: updatedRoom.creator,
        guessers: updatedRoom.guesser,
        place: updatedRoom.place,
        winner: updatedRoom.winner,
      });

      console.log(`Here is the updated place: ${updatedRoom.place}`);
      // console.log(room[roomCode]);
    });

    socket.on("hint", (hint1, hint2, hint3) => {
      setHint([hint1, hint2, hint3]);
      console.log(`Here are the hints: ${hint1}, ${hint2}, ${hint3}`);
    });

    socket.on("gameWon", (playerId) => {
      if (socket.id === playerId) {
        setGameWon(true);
      } else {
        setMessage("Opponent has won!");
      }
    });

    socket.on("wrongGuess", (message) => {
      setMessage2(message);
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

  const handleStartGame = () => {
    socket.emit("startGame", roomCode);
  };

  const handleGuessPlace = (event) => {
    event.preventDefault();
    const guess = event.target.elements.guess.value;
    socket.emit("guessPlace", roomCode, guess);
  };
  const handleEntityAddition = (event) => {
    event.preventDefault();
    const entity = event.target.elements[0].value;

    socket.emit("addEntity", roomCode, entity);
    if (entity) {
      setGameStarted(true);
    }
    socket.emit("getHint", roomCode);
  };

  const handleGetHint = async (index) => {
    if (hintsDisplay.includes(hints[index])) {
      return;
    }
    setHintsDisplay([...hintsDisplay, hints[index]]);
    setMessage2("");
  };

  return (
    <div className="container">
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
          <p className="message">{message}</p>
        </div>
      ) : (
        <div>
          <h2>Room Code: {roomCode}</h2>
          {!gameWon ? (
            <div>
              {!message && socket.id === room?.creator && (
                <div>
                  <button
                    onClick={handleStartGame}
                    disabled={room?.guessers.length === 0}
                  >
                    Start Game
                  </button>
                  <p>Players Joined: {room?.guessers.length + 1}</p>
                </div>
              )}
              {gameStarted && socket.id === room?.creator && (
                <form onSubmit={handleEntityAddition}>
                  <input type="text" />
                  <button type="submit">Add Place</button>
                </form>
              )}
              {!gameStarted && socket.id !== room?.creator && (
                <p>Waiting for the creator to start the game...</p>
              )}
              {gameStarted &&
                socket.id !== room?.creator &&
                room.place.length === 0 && (
                  <p>Waiting for the creator to add a place...</p>
                )}

              {message && <p className="message">{message}</p>}
              {!message &&
                gameStarted &&
                socket.id !== room?.creator &&
                room.place.length > 0 && (
                  <div>
                    <form onSubmit={handleGuessPlace}>
                      <input type="text" name="guess" />
                      <button type="submit">Guess</button>

                      <p className="message">{message}</p>
                    </form>
                    <button onClick={() => handleGetHint(0)}>Hint1</button>
                    <button onClick={() => handleGetHint(1)}>Hint2</button>
                    <button onClick={() => handleGetHint(2)}>Hint3</button>
                  </div>
                )}
              {hintsDisplay.map((hint, index) => (
                <p className="hint" key={index}>
                  {hint}
                </p>
              ))}

              {message2 && <p className="message">{message2}</p>}
            </div>
          ) : (
            <h2 className="winner-message">Congratulations! You won!</h2>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
