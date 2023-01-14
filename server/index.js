const express = require('express');
const app = express();
const http = require('http');
const cors = require("cors")
const {Server} = require('socket.io')
const mongoose = require('mongoose');
const { type } = require('os');



app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods:["GET", "POST"],
    },
})
const clients = io.sockets.adapter.rooms.get('sdf');
const getClients=(room)=>{
    console.log(io.sockets.adapter.rooms.get(room));
}

const clientRooms = {};
const state = {};
io.on('connection',(socket)=>{
    console.log("User connected with id: ", socket.id);
    // socket.emit('init',{data:'hello world!'});
    // socket.on('send_message', (data)=>{
    //     socket.to(data.room).emit(' gff',data.chat);
    // })
    // socket.on("join_room",async (data)=>{
       
    //     const socketss = await io.in(data.room_name).fetchSockets();
    //     socketss.forEach((a)=>{
    //         console.log(a.id);
    //     })
    //     if(socketss.length >1){
    //         socket.emit('join_error', {
    //             err:"Room is full!"
    //         })
    //     }else{
    //         socket.join(data.room_name)
    //         console.log(`User ${socket.id} joined the room ${data.room_name}`);
    //         socket.emit("room_joined");
    //     }
    // })
    socket.on('join_room',async (data)=>{
        console.log("Here done");
        const room = io.sockets.adapter.rooms.get(data.roomName);
        var clientCount = 0;
        
        if(room){
            room.forEach((a)=>{
                clientCount = clientCount+1;
            })
        }
        if (clientCount === 0) {
            socket.emit('unknown_game');
        }else if(clientCount>1){
            socket.emit('room_full');
        }else{
            clientRooms[socket.id]=data.roomName;
            await socket.join(data.roomName);
            socket.number=2;
            socket.emit('init',2);
            io.in(data.roomName).emit('start_game');
        }
        
        
    })
    socket.on('create_room',(data)=>{
        clientRooms[socket.id] = data.roomCreated;

        socket.emit('game_code', data.roomCreated);
        // state[data.roomCreated] = gameState();
        socket.join(data.roomCreated);
        socket.number = 1;
        socket.emit('init',1);
        // const room = io.sockets.adapter.rooms[data.roomCreated];


        console.log(`User ${socket.id} joined the room ${data.roomCreated}`);
    })
    // function handleJoinGame()
    
    // socket.on('join_room',(data)=>{
    //     console.log("here");
    //     const room = io.sockets.adapter.rooms[data.code];
    //     let allUsers;
    //     if(room){
    //         allUsers=room.sockets;
    //     }
    //     let numClients;
    //     if(allUsers){
    //         numClients=Object.key(allUsers).length;
    //     }

    //     if(numClients===0){
    //         socket.emit('unknown_game');
    //     }else if(numClients>1){
    //         socket.emit('room_full');
    //     }else{
    //         clientRooms[socket.id]=data.code;
    //         socket.join(data.code);
    //         socket.number = 2;
    //         socket.emit('init',2);
    //     }
        
    // })

    // io.socket.adapter.on("create-room", (data)=>{
    //     console.log(`room ${data.roomCreated} was created`);
    // })
    // io.of("/").adapter.on("create-room", (room) => {
    //     console.log(`room ${room} was created`);
    //   });
})

server.listen(8080, ()=>{
    console.log("Server is running....");
})