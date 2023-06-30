const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
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
// const clients = io.sockets.adapter.rooms.get("sdf");
// const getClients = (room) => {
//   console.log(io.sockets.adapter.rooms.get(room));
// };

// const clientRooms = {};
// const state = {};
// io.on("connection", (socket) => {
//   console.log("User connected with id: ", socket.id);

//   socket.on("join_room", async (data) => {
//     const room = io.sockets.adapter.rooms.get(data.roomName);
//     var clientCount = 0;
//     var joinCategory;
//     if (room) {
//       room.forEach((a) => {
//         clientCount = clientCount + 1;
//       });
//       var count = 0;
//       room.forEach((element) => {
//         if (count === 1) {
//           joinCategory = element;
//         }
//         count = count + 1;
//       });
//     }
//     if (clientCount === 0) {
//       socket.emit("unknown_game");
//     } else if (clientCount > 2) {
//       socket.emit("room_full");
//     } else {
//       clientRooms[socket.id] = data.roomName;
//       await socket.join(data.roomName);
//       socket.number = 2;
//       socket.emit("init", 2);
//       io.in(data.roomName).emit("start_game", { joinCategory });
//     }
//   });
//   socket.on("create_room", async (data) => {
//     clientRooms[socket.id] = data.roomCreated;

//     socket.emit("game_code", data.roomCreated);
//     // state[data.roomCreated] = gameState();
//     await socket.join(data.roomCreated);
//     const theRoom = io.sockets.adapter.rooms.get(data.roomCreated);

//     theRoom.add(data.cate);

//     socket.number = 1;
//     socket.emit("init", 1);
//     // const room = io.sockets.adapter.rooms[data.roomCreated];

//     console.log(`User ${socket.id} joined the room ${data.roomCreated}`);
//   });

//   socket.on("name_submit", (data) => {
//     console.log("Here.....");
//     console.log(data.Name);
//     const entityName = data.Name;
//     console.log(data.room);
//     io.in(data.room).emit("enter_game", { entityName });
//   });
// });

// // Routes

// app.post("/", async (req, res) => {
//   const question = req.body.question;

//   const hints = await askGPT(question);
//   // console.log(hints);

//   if (hints) {
//     res.send(hints);
//   }
// });

// server.listen(8080, () => {
//   console.log("Server is running....");
// });
// const express = require("express");
// const http = require("http");
const socketIO = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server);

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
      winner: "", // Replace with your logic to randomly select a place
    };

    // Join the room
    socket.join(roomCode);
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
      io.to(room.creator).emit("updateRooms", room);
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
      console.log(`starting game in the room ${roomCode}`);
      socket.emit("gameStarted", room);

      room.guesser.forEach((guesser) => {
        io.to(guesser).emit("gameStarted", room);
      });
    }
  });

  socket.on("addEntity", (roomCode, entity) => {
    const room = rooms[roomCode];
    room.place = entity;

    socket.emit("updateRooms", room);

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

        room.guesser.forEach((guesser) => {
          io.to(guesser).emit("gameWon", socket.id);
        });
        io.to(room.creator).emit("gameWon", socket.id);
      } else {
        const message = `${guess} is not correct. Try again!`;
        socket.emit("wrongGuess", message);
      }
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
