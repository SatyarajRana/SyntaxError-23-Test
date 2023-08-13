import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import io from "props.socket.io-client";
import "../styles.css";
import { CSSProperties } from "react";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

// const override: CSSProperties = {
//   display: "block",
//   margin: "0 auto",
//   borderColor: "red",
// };
const override = {
  display: "block",
  margin: "5% auto",
  borderColor: "red",
};
// const props socket.= io("http://localhost:8080"); // Replace with your server URL

const App = (props) => {
  const { username } = useParams();
  const [roomCode, setRoomCode] = useState();
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [message2, setMessage2] = useState("");
  const [hints, setHint] = useState([]);
  const [hintsDisplay, setHintsDisplay] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  // const [(room.place.length !== 0), setPlaceAdded] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [room, setRoom] = useState({
    creator: "",
    guessers: [],
    place: "",
    winner: "",
    currentTurn: "",
    currentTurnIndex: 0,
    started: false,
  });

  useEffect(() => {
    // Event listeners for server events

    props.socket.on("roomCreated", (roomCode) => {
      setRoomCode(roomCode);
    });

    props.socket.on("roomJoined", (roomCode) => {
      setRoomCode(roomCode);
    });

    props.socket.on("joinRoomFailed", (message) => {
      setMessage(message);
    });

    props.socket.on("gameStarted", (room) => {
      setGameStarted(true);
    });

    props.socket.on("updateRooms", (updatedRoom) => {
      setRoom({
        creator: updatedRoom.creator,
        guessers: updatedRoom.guesser,
        place: updatedRoom.place,
        winner: updatedRoom.winner,
        currentTurn: updatedRoom.currentTurn,
        currentTurnIndex: updatedRoom.currentTurnIndex,
        started: updatedRoom.started,
      });

      // console.log(room[roomCode]);
    });

    props.socket.on("hint", (hint1, hint2, hint3) => {
      setHint([hint1, hint2, hint3]);
    });

    props.socket.on("turnOver", (playerId, roomCode) => {
      showSpinner(1);

      props.socket.emit("nextTurn", roomCode);
    });

    props.socket.on("wrongGuess", (message) => {
      setMessage(message);
    });

    props.socket.on("gameOver", (winner) => {
      console.log(`Game over. The winner is ${winner}`);
      setGameOver(true);
    });

    return () => {
      // Clean up event listeners
      props.socket.off("roomCreated");
      props.socket.off("roomJoined");
      props.socket.off("joinRoomFailed");
      props.socket.off("hint");
      props.socket.off("gameOver");
      props.socket.off("gameStarted");
      props.socket.off("updateRooms");
      props.socket.off("turnOver");
      props.socket.off("wrongGuess");
    };
  }, []);

  function showSpinner(time) {
    setShowLoadingSpinner(true);
    setTimeout(() => {
      setShowLoadingSpinner(false);
    }, time * 1000);
  }

  const handleCreateRoom = () => {
    showSpinner(3);
    var randomNum = Math.floor(Math.random() * 9000) + 1000;

    props.socket.emit("createRoom", randomNum);
  };

  const handleJoinRoom = () => {
    showSpinner(3);
    props.socket.emit("joinRoom", joinCode);
  };

  const handleStartGame = () => {
    showSpinner(1);
    props.socket.emit("startGame", roomCode);
  };

  const handleGuessPlace = (event) => {
    event.preventDefault();
    const guess = event.target.elements.guess.value;
    props.socket.emit("guessPlace", roomCode, guess);
  };
  const handleEntityAddition = (event) => {
    showSpinner(1);
    event.preventDefault();
    const entity = event.target.elements[0].value;

    props.socket.emit("addEntity", roomCode, entity);

    props.socket.emit("getHint", roomCode);
  };

  const handleGetHint = async (index) => {
    if (hintsDisplay.includes(hints[index])) {
      return;
    }
    setHintsDisplay([...hintsDisplay, hints[index]]);
    setMessage2("");
  };

  return showLoadingSpinner ? (
    <div className="spinner-container">
      <ClimbingBoxLoader color="#36d7b7" cssOverride={override} />
    </div>
  ) : (
    <div className="container">
      {!roomCode ? (
        // The div that can create a Room or join a Room
        <div>
          <h1>Create a Room</h1>

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
        // The div that can start the game, add entity, and guess the place
        <div>
          <h2>Room Code: {roomCode}</h2>
          {!gameOver ? (
            <div>
              {!gameStarted && props.socket.id === room?.creator && (
                <div>
                  <button
                    onClick={handleStartGame}
                    disabled={room?.guessers.length === 0}
                  >
                    Start Game
                  </button>
                </div>
              )}
              {!gameStarted && props.socket.id !== room?.creator && (
                <p>Waiting for the creator to start the game...</p>
              )}
              {gameStarted &&
                !(room.place.length !== 0) &&
                props.socket.id === room?.currentTurn && (
                  <form onSubmit={handleEntityAddition}>
                    <input type="text" />
                    <button type="submit">Add Place</button>
                  </form>
                )}

              {gameStarted &&
                !(room.place.length !== 0) &&
                props.socket.id !== room?.creator && (
                  <p>Waiting for the player to add a place...</p>
                )}

              {gameStarted &&
                room.place.length !== 0 &&
                props.socket.id !== room?.currentTurn && (
                  <div>
                    <form onSubmit={handleGuessPlace}>
                      <input type="text" name="guess" />
                      <button type="submit">Guess</button>

                      <p className="message">{message}</p>
                    </form>
                    <button onClick={() => handleGetHint(0)}>Hint1</button>
                    <button onClick={() => handleGetHint(1)}>Hint2</button>
                    <button onClick={() => handleGetHint(2)}>Hint3</button>
                    {hintsDisplay.map((hint, index) => (
                      <p className="hint" key={index}>
                        {hint}
                      </p>
                    ))}
                  </div>
                )}
              {gameStarted &&
                room.place.length !== 0 &&
                props.socket.id === room?.currentTurn && (
                  <p>Waiting for the players to guess the place...</p>
                )}
              <p>Players Joined: {room?.guessers.length}</p>
            </div>
          ) : (
            <h2 className="leaderboard">Leaderboard</h2>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
