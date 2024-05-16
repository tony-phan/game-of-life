"use client";

import { useEffect, useRef, useState } from "react";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const WIDTH = 900;
const HEIGHT = 900;
const CELL_SIZE = 30;
const NUM_ROWS = Math.floor(WIDTH / CELL_SIZE);
const NUM_COLS = Math.floor(HEIGHT / CELL_SIZE);

const colors = ["black", "white"];

type Board = number[][];

function createBoard() : Board {
  return Array.from({ length: NUM_ROWS }, () => 
    Array.from({ length: NUM_COLS }, () => 0)
  );
}

export default function Home() {
  const board = createBoard();
  const [boardState, setBoardState] = useState<Board>(board);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const [switchStates, setSwitchStates] = useState({ boundarySwitch: true, seedSwitch: false });

  let nextBoardFunct = switchStates.seedSwitch ? computeNextBoardSeeds : computeNextBoard;

  useEffect(() => {
    if(!isPlaying) {
      return;
    }

    const interval = setInterval(nextBoardFunct, 100);
    return () => clearInterval(interval);
  }, [isPlaying, nextBoardFunct]);

  useEffect(() => {
    if(canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if(!ctx) return;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 0.1;

      for(let r = 0; r < boardState.length; ++r) {
        for(let c = 0; c < boardState[r].length; ++c) {
          ctx.fillStyle = colors[boardState[r][c]];
          
          ctx.fillRect(
            Math.floor(WIDTH / NUM_COLS * r), 
            Math.floor(HEIGHT / NUM_ROWS * c), 
            CELL_SIZE, 
            CELL_SIZE
          );

          ctx.strokeRect(
            Math.floor(WIDTH / NUM_COLS * r), 
            Math.floor(HEIGHT / NUM_ROWS * c), 
            CELL_SIZE, 
            CELL_SIZE
          );
        }
      }
    }
  }, [boardState]);

  function inBounds(r: number, c: number) {
    return 0 <= r && r < NUM_ROWS && 0 <= c && c < NUM_COLS;
  }

  function countNeighbors(r: number, c: number) {
    const directions = [
      [-1, 0], // up
      [1, 0],  // down
      [0, -1], // left
      [0, 1],  // right
      [-1,-1], // top-left
      [-1, 1], // top-right
      [1, -1], // bottom-left
      [1, 1]   // bottom-right
    ];

    let numAliveNeighbors = 0;
    for(let direction of directions) {
      if(switchStates.boundarySwitch && !inBounds(r + direction[0], c + direction[1])) {
        continue;
      }

      let row = switchStates.boundarySwitch ? r + direction[0] : (r + direction[0] + NUM_ROWS) % NUM_ROWS;
      let column = switchStates.boundarySwitch ? c + direction[1] : (c + direction[1] + NUM_COLS) % NUM_COLS;
      let neighbor = boardState[row][column];
      if(neighbor === 1) {
        ++numAliveNeighbors;
      }
    }
    return numAliveNeighbors;
  }

  function computeNextBoard() {
    setBoardState((prevBoardState) => {
      let newBoard = prevBoardState.map((row) => [ ...row ]);

      for(let r = 0; r < boardState.length; ++r) {
        for(let c = 0; c < boardState[r].length; ++c) {
          let aliveNeighborCount = countNeighbors(r, c);
          if(prevBoardState[r][c] === 0) {
            if(aliveNeighborCount === 3) {
              newBoard[r][c] = 1;
            }
          } else {
            if(aliveNeighborCount !== 2 && aliveNeighborCount !== 3) {
              newBoard[r][c] = 0;
            }
          }          
        }
      }
      return newBoard;
    });
  }

  const switchEventHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwitchStates({
      ...switchStates,
      [event.target.name]: event.target.checked
    });
  }

  function computeNextBoardSeeds() {
    setBoardState((prevBoardState) => {
      let newBoard = prevBoardState.map((row) => [ ...row ]);

      for(let r = 0; r < boardState.length; ++r) {
        for(let c = 0; c < boardState[r].length; ++c) {
          let aliveNeighborCount = countNeighbors(r, c);
          if(prevBoardState[r][c] === 0) {
            if(aliveNeighborCount === 2) {
              newBoard[r][c] = 1;
            }
          } else {
            newBoard[r][c] = 0;
          }          
        }
      }
      return newBoard;
    });
  }

  function clearBoard() {
    setBoardState(board);
  }

  function cellClickHandler(e: any) {
    const x = Math.floor(e.nativeEvent.offsetX / CELL_SIZE);
    const y = Math.floor(e.nativeEvent.offsetY / CELL_SIZE);
    
    let updatedBoardState = [ ...boardState ];
    if(updatedBoardState[x][y] === 0) {
      updatedBoardState[x][y] = 1;
    } else {
      updatedBoardState[x][y] = 0;
    }
    setBoardState(updatedBoardState);
  } 

  return (
    <div>
      <h1 className="text-3xl text-center font-mono mt-4">Game of Life</h1>
      <div className="flex justify-evenly flex-row items-center">
          <button className="py-4" onClick={nextBoardFunct}>Next</button>
          <button className="py-4" onClick={() => setIsPlaying(!isPlaying)}>{ isPlaying ? "Stop" : "Play"}</button>
          <button className="py-4" onClick={clearBoard}>Reset</button>
      </div>
      <div className="flex justify-evenly flex-row items-center">
      <FormGroup row>
        <FormControlLabel control={<Switch defaultChecked name="boundarySwitch" onChange={switchEventHandler} />} label="Enforce Boundaries" />
        <FormControlLabel control={<Switch name="seedSwitch" onChange={switchEventHandler} />} label="Enable Seeds" />
      </FormGroup>
      </div>

      <div className="flex justify-center mt-4">
        <canvas 
          onClick={(e) => cellClickHandler(e)}
          ref={canvasRef}
          width={WIDTH} 
          height={HEIGHT}
          className="bg-gray-900"
      ></canvas>

      </div>
    </div>
  );
}
