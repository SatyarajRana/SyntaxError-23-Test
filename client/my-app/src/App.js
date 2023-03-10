
import './App.css';
import { io } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from 'react';
import Home, { Game, Game2_1, Game2, Game1_2 } from "./pages/home/Home";
// import GameContext from './gameContext';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Routes,
  Redirect,
} from "react-router-dom";
import { customAlphabet } from 'nanoid'
import { redirect } from 'next/dist/server/api-utils';


const nanoid = customAlphabet('1234567890abcdef', 5)

const GameContext = createContext();
const PlayerNumContext = createContext();
const Category = createContext();
const RoomCreated = createContext();
const Entered = createContext();
const Entity = createContext();

// const socket = io.connect("http://localhost:8080");

function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [playerNumber, setPlayerNumber] = useState();
  const [category, setCategory] = useState('');
  const [roomCreated, setCreated] = useState('');
  const [entered, setEntered] = useState(false);
  const [entity, setEntity] = useState('');

  return (
    <GameContext.Provider value={{ isInRoom, setInRoom }}>
      <PlayerNumContext.Provider value={{ playerNumber, setPlayerNumber }}>
        <Category.Provider value={{ category, setCategory }}>
          <RoomCreated.Provider value={{ roomCreated, setCreated }}>
            <Entered.Provider value={{ entered, setEntered }}>
              <Entity.Provider value={{ entity, setEntity }}>
                <div>
                  {!isInRoom && <Home />}
                  {!entered && isInRoom && playerNumber === 1 && <Game cat={category} room={roomCreated} />}
                  {!entered && isInRoom && playerNumber === 2 && <Game2 categ={category} />}
                  {entered && playerNumber === 2 && <Game2_1 ent={entity} />}
                  {entered && playerNumber === 1 && <Game1_2 />}

                </div>
              </Entity.Provider>
            </Entered.Provider>
          </RoomCreated.Provider>
        </Category.Provider>
      </PlayerNumContext.Provider>
    </GameContext.Provider>

    // {}
  );
}

export default App;
export { GameContext, PlayerNumContext, Category, RoomCreated, Entered, Entity }
