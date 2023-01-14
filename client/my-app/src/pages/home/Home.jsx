import React, { createContext, useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { io } from "socket.io-client";
import { Category, GameContext, PlayerNumContext } from "../../App"; 

const socket = io.connect("http://localhost:8080"); 
// var isinRoom = false;


export default function Home(props) {

    // const { isInRoom, setInRoom } = useState(false);
    // const [isInRoom, setInRoom] = useState(false);
    const { setInRoom, isInRoom } = useContext(GameContext);
    const {playerNumber, setPlayerNumber} = useContext(PlayerNumContext);
    const {category, setCategory } = useContext(Category);


     socket.on('init',(data)=>{
        setPlayerNumber(data);
        console.log(data);
    })
    socket.on('unknown_game',()=>{
        console.log("This room does not exist");
    })
    socket.on('room_full',()=>{
        console.log("Room is full!");
    })
    socket.on('start_game',(data)=>{
        console.log("The game has started for you!");
        setCategory(data.joinCategory)
        setInRoom(true);

        

    })

    const [roomName, setRoomName] = useState("");
    const [roomCreated, setCreated] = useState('');
    const [isJoining, setJoining] = useState(false);

    

    const handleRoomNameChange = (e)=>{
        const val = e.target.value;
        setRoomName(val);
    }

    const handleRoomNameCreation=(e)=>{
        const val2 = e.target.value;
        setCreated(val2);

    }
    function displayCategories(){
        const cat = prompt("Enter category:");
        
        return cat;
    }

    var cate = null;
    const  CreateRoom=()=>{
        cate = displayCategories();
        // setCategory(cate);
        socket.emit("create_room",{roomCreated,cate});
    }
    // var joined = false;
    // const JoinRoom=()=>{
    //     console.log("here.....");
    //     const code = roomName;
    //     socket.emit('join_room,',{code});
    // }
    const JoinRoom=()=>{

        
        socket.emit('join_room',{roomName})
    }

    useEffect(()=>{
        socket.on("join_error",(data)=>{
            alert(data.err)
        });
        // socket.on("room_joined",()=>{
        //     console.log("Room joined set to true");
        //     // joined = true;
        // });
    },[socket])
    

   
    return (
        
        <div className="homeContainer">
        <h3>Enter room id:</h3>
        <input type="text" placeholder="Room ID" value={roomName} onChange={handleRoomNameChange}/>
        <button onClick={JoinRoom}>{isJoining ? "Joining..." : "Join"}</button>
        <input type="text" onChange={handleRoomNameCreation}/>
        <button onClick={CreateRoom}>Create</button>
        {/* {isInRoom? <h2>Game joined</h2>:<h2></h2>} */}

        </div>
        
      
    );
  }