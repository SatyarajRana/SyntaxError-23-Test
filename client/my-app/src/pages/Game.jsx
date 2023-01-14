import React from "react";
// import { ReactDOM } from "react-dom";

export default function Game(props) {
    return (
        <div>
            <h1>This is game</h1>
            <form>
            <h2>Enter a {props.cat}</h2>
            <input type="text" />
            <button type="submit">Start</button>
            </form>
        </div>
    )
}