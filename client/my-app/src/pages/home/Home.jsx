import React, { createContext, useContext } from "react";

import axios from 'axios';

import { useEffect } from "react";
import { useState } from "react";
import { io } from "socket.io-client";
import { Category, Entered, GameContext, PlayerNumContext, RoomCreated, Entity } from "../../App";

const socket = io.connect("http://localhost:8080");
// var isinRoom = false;


export default function Home(props) {

    // const { isInRoom, setInRoom } = useState(false);
    // const [isInRoom, setInRoom] = useState(false);
    const { isInRoom, setInRoom } = useContext(GameContext);
    const { playerNumber, setPlayerNumber } = useContext(PlayerNumContext);
    const { category, setCategory } = useContext(Category);
    // const {roomName, setRoomName} = useContext(RoomName);
    const { roomCreated, setCreated } = useContext(RoomCreated);
    const { entered, setEntered } = useContext(Entered);
    const { entity, setEntity } = useContext(Entity);

    socket.on('init', (data) => {
        setPlayerNumber(data);
        console.log(data);
    })
    socket.on('unknown_game', () => {
        console.log("This room does not exist");
    })
    socket.on('room_full', () => {
        console.log("Room is full!");
    })
    socket.on('start_game', (data) => {
        console.log("The game has started for you!");
        setCategory(data.joinCategory)
        setInRoom(true);
    })
    socket.on('enter_game', (data) => {
        setEntered(true);
        setEntity(data.entityName);
        startGameSequence();
        console.log("The choosen entity is " + data.entityName);
    })

    const [roomName, setRoomName] = useState("");

    const [isJoining, setJoining] = useState(false);



    const startGameSequence = () => {

    }
    const handleRoomNameChange = (e) => {
        const val = e.target.value;
        setRoomName(val);
    }

    const handleRoomNameCreation = (e) => {
        const val2 = e.target.value;
        setCreated(val2);

    }
    function displayCategories() {
        const cat = prompt("Enter category:");

        return cat;
    }

    var cate = null;
    const CreateRoom = () => {
        cate = displayCategories();
        socket.emit("create_room", { roomCreated, cate });
    }

    const JoinRoom = () => {
        socket.emit('join_room', { roomName })
    }



    useEffect(() => {
        socket.on("join_error", (data) => {
            alert(data.err)
        });

    }, [socket])



    return (

        <div className="homeContainer">
            <h3>Enter room id:</h3>
            <input type="text" placeholder="Room ID" value={roomName} onChange={handleRoomNameChange} />
            <button onClick={JoinRoom}>{isJoining ? "Joining..." : "Join"}</button>
            <input type="text" onChange={handleRoomNameCreation} />
            <button onClick={CreateRoom}>Create</button>
            {/* {isInRoom? <h2>Game joined</h2>:<h2></h2>} */}

        </div>


    );
}
export function Game(props) {

    const [Name, setName] = useState('');
    const room = props.room;
    const handleSubmit = () => {
        socket.emit('name_submit', { Name, room });
        console.log("Submitted");
    }

    const handleNameChange = (e) => {
        setName(e.target.value);
    }
    return (
        <div>
            <h1>This is game</h1>
            <h2>{room}</h2>

            <h2>Enter a {props.cat}</h2>
            <input type="text" onChange={handleNameChange} />
            <button onClick={handleSubmit}>Start</button>

        </div>
    )
}

export function Game2(props) {
    return (
        <div>
            <h1>Waiting for Player one to choose a {props.categ}</h1>

        </div>
    )
}

export function Game2_1(props) {

    const [nameGuess, setNameGuess] = useState('');

    const handleNameGuess = (e) => {
        setNameGuess(e.target.value);
    }

    const nameGuessSubmit = () => {
        console.log("Here is what you entered..." + nameGuess);
        console.log("Here is the answer..." + props.ent);
    }
    const [hints,setHints] = useState([]);
    let hintsTest=[];
    const getHint = () => {
        axios({
            method: "post",
            url: `http://localhost:8080/`,
            data: {
                question: JSON.stringify(props.ent)
            }

        }).then((response) => {
            
            // console.log(response);
            let hints = response.data;
            console.log(hints);
        });
    }
    
    return (
        <div>
            <input type="text" onChange={handleNameGuess} />
            <button onClick={nameGuessSubmit}>Check</button>
            <button onClick={getHint}>Hint</button>
            <div>
                {hints.map((hint)=>(
                    <p>hint</p>
                ))}
            </div>
        </div>
    )
}

export function Game1_2(props) {


    return (
        <div>
            <h1>Waiting for the player to guess!</h1>
        </div>
    )
}