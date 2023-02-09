const express = require('express');
const app = express();
const http = require('http');
const cors = require("cors")
const { Server } = require('socket.io')
// const mongoose = require('mongoose');
const { type } = require('os');
const OpenAI = require('openai')
const axios = require('axios');

const bodyParser = require('body-parser');

const port = 8080;

const { Configuration, OpenAIApi } = OpenAI

const configuration = new Configuration({
    organization: "org-GupIEwtDhWe8IOmfKNkXlbHa",
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})
const clients = io.sockets.adapter.rooms.get('sdf');
const getClients = (room) => {
    console.log(io.sockets.adapter.rooms.get(room));
}

const clientRooms = {};
const state = {};
io.on('connection', (socket) => {
    console.log("User connected with id: ", socket.id);

    socket.on('join_room', async (data) => {

        const room = io.sockets.adapter.rooms.get(data.roomName);
        var clientCount = 0;
        var joinCategory;
        if (room) {
            room.forEach((a) => {
                clientCount = clientCount + 1;
            })
            var count = 0;
            room.forEach(element => {
                if (count === 1) {
                    joinCategory = element;
                }
                count = count + 1;
            });

        }
        if (clientCount === 0) {
            socket.emit('unknown_game');
        } else if (clientCount > 2) {
            socket.emit('room_full');
        } else {
            clientRooms[socket.id] = data.roomName;
            await socket.join(data.roomName);
            socket.number = 2;
            socket.emit('init', 2);
            io.in(data.roomName).emit('start_game', { joinCategory });

        }


    })
    socket.on('create_room', async (data) => {
        clientRooms[socket.id] = data.roomCreated;

        socket.emit('game_code', data.roomCreated);
        // state[data.roomCreated] = gameState();
        await socket.join(data.roomCreated);
        const theRoom = io.sockets.adapter.rooms.get(data.roomCreated);

        theRoom.add(data.cate);



        socket.number = 1;
        socket.emit('init', 1);
        // const room = io.sockets.adapter.rooms[data.roomCreated];


        console.log(`User ${socket.id} joined the room ${data.roomCreated}`);
    })

    socket.on('name_submit', (data) => {
        console.log("Here.....");
        console.log(data.Name);
        const entityName = data.Name;
        console.log(data.room);
        io.in(data.room).emit('enter_game', { entityName })

    })
})
app.use(bodyParser.json());
app.use(cors());
app.post('/', async (req, res) => {

    const question = req.body.question;
    console.log(req.body.question);

    function countCharsAndSpaces(sentence) {
        let charCount = 0;
        let spaceIndices = [];
        for (let i = 0; i < sentence.length; i++) {
            if (sentence[i] === " ") {
                spaceIndices.push(i);
            }
            charCount++;
        }
        let result = [charCount, spaceIndices];
        return result;
    }

    const characters = countCharsAndSpaces(req.body.question)




    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: ` gimme a tough clue about ` + question + `without using the word ` + question,
        max_tokens: 100,
        temperature: 0,
    });






    console.log(response.data)
    if (response.data) {
        if (response.data.choices[0].text) {

            let data = {
                message: response.data.choices[0].text,
                characters: characters
            }
            res.send(data);

            // res.json({ message: response.data.choices[0].text })
            // res.json({ characters: countCharsAndSpaces(question) })

        }
    }



});

server.listen(8080, () => {
    console.log("Server is running....");
})