const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const env = require("dotenv").config();
// // const mongoose = require('mongoose');
// const { type } = require("os");

// const axios = require("axios");
// const { askGPT } = require("./services/openai");

const bodyParser = require("body-parser");

// const port = 8080;

const { askGPT } = require("./services/openai");
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const socketIO = require("socket.io");

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle room creation
  socket.on("createRoom", (roomCode) => {
    // Create a new room with the provided code
    rooms[roomCode] = {
      creator: socket.id,
      guesser: [],
      place: "",
      winner: "",
      currentTurn: "",
      currentTurnIndex: 0,
    };
    // room = rooms[roomCode];

    // Join the room
    socket.join(roomCode);
    rooms[roomCode].guesser.push(socket.id);
    socket.emit("updateRooms", rooms[roomCode]);
    // Emit event to the creator that the room has been created
    socket.emit("roomCreated", roomCode);
  });

  // Handle joining a room
  socket.on("joinRoom", (roomCode) => {
    const room = rooms[roomCode];

    // Check if the room exists and the guesser slot is available
    if (room) {
      // Join the room as the guesser
      socket.join(roomCode);
      room.guesser.push(socket.id);

      // Emit event to the guesser that they have successfully joined the room
      socket.emit("roomJoined", roomCode);

      room.guesser.forEach((guesser) => {
        io.to(guesser).emit("updateRooms", room);
      });
    } else {
      // Emit event to the guesser that joining the room failed
      socket.emit("joinRoomFailed");
    }
  });

  socket.on("startGame", (roomCode) => {
    const room = rooms[roomCode];

    // Check if the room exists, the creator has joined, and the guesser has joined
    if (room && room.creator === socket.id) {
      // Emit event to both players that the game has started

      // get info about all joined sockets in the room

      // Updating the current turn
      room.currentTurn = room.guesser[room.currentTurnIndex];

      room.guesser.forEach((guesser) => {
        io.to(guesser).emit("updateRooms", room);
      });

      room.guesser.forEach((guesser) => {
        io.to(guesser).emit("gameStarted", room);
      });
    }
  });

  socket.on("addEntity", (roomCode, entity) => {
    const room = rooms[roomCode];
    room.place = entity;

    room.guesser.forEach((guesser) => {
      io.to(guesser).emit("updateRooms", room);
    });
  });

  // Handle place guessing
  socket.on("guessPlace", async (roomCode, guess) => {
    const room = rooms[roomCode];

    // Check if the room exists and the guesser has joined
    if (room && room.guesser.includes(socket.id)) {
      // Check if the guess is correct
      if (guess.toLowerCase() === room.place.toLowerCase()) {
        // Emit event to both players that the guesser has won
        console.log("Turn over emitted");
        socket.emit("turnOver", socket.id, roomCode);
      } else {
        const message = `${guess} is not correct. Try again!`;
        socket.emit("wrongGuess", message);
      }
    }
  });
  socket.on("nextTurn", (roomCode) => {
    const room = rooms[roomCode];
    console.log("Next turn emitted");
    // console.log(`Current turn index: ${room.currentTurnIndex}`);
    room.currentTurnIndex = room.currentTurnIndex + 1;
    // console.log(`Next turn index: ${room.currentTurnIndex}`);

    if (room.currentTurnIndex >= room.guesser.length) {
      room.guesser.forEach((guesser) => {
        io.to(guesser).emit("gameOver", room);
      });
    } else {
      room.place = "";
      room.currentTurn = room.guesser[room.currentTurnIndex];
      room.guesser.forEach((guesser) => {
        io.to(guesser).emit("updateRooms", room);
      });
    }
  });

  socket.on("getHint", async (roomCode, question) => {
    const room = rooms[roomCode];

    const hints = await askGPT(room.place);

    const hintList = hints.split(/\d+\./);

    // Remove any leading/trailing whitespaces from each hint
    const trimmedHints = hintList.map((hint) => hint.trim());

    // Store each hint in separate strings
    const hint1 = trimmedHints[1];
    const hint2 = trimmedHints[2];
    const hint3 = trimmedHints[3];

    // const hint1 = "hint1";
    // const hint2 = "hint2";
    // const hint3 = "hint3";

    room.guesser.forEach((guesser) => {
      io.to(guesser).emit("hint", hint1, hint2, hint3);
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove the room if the creator disconnects
    Object.keys(rooms).forEach((roomCode) => {
      if (rooms[roomCode].creator === socket.id) {
        delete rooms[roomCode];
      }
    });
  });
});

server.listen(8080, () => {
  console.log("Server started on port 8080");
});
