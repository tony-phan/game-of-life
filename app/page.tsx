"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import styles from './page.module.css';
import { Button, Link } from "@mui/material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WIDTH = 900;
const HEIGHT = 900;
const CELL_SIZE = 20;
const NUM_ROWS = Math.floor(WIDTH / CELL_SIZE);
const NUM_COLS = Math.floor(HEIGHT / CELL_SIZE);
const NUM_CELLS = NUM_ROWS * NUM_COLS;
const colors = ["black", "white"];

type Board = number[][];

function createBoard() : Board {
  return Array.from({ length: NUM_ROWS }, () => 
    Array.from({ length: NUM_COLS }, () => Math.floor(Math.random() * 2)) // return either 0 or 1 randomly, used to set default state of the board
  );
}

export default function Home() {
  const board = createBoard();
  const [boardState, setBoardState] = useState<Board>(board);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const [switchStates, setSwitchStates] = useState({ boundarySwitch: true, seedSwitch: false });
  const [epochs, setEpochs] = useState(0);

  let nextBoardFunct = switchStates.seedSwitch ? computeNextBoardSeeds : computeNextBoard;

  const numAliveCells = useMemo(() => {
    let result = 0;
    for(let r = 0; r < boardState.length; ++r) {
      for(let c = 0; c < boardState[r].length; ++c) {
        if(boardState[r][c] == 1) {
          ++result;
        }
      }
    }
    return result;
  }, [boardState]);

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
    setEpochs((previousState) => previousState + 1);
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
    setEpochs((previousState) => previousState + 1);
  }

  function clearBoard() {
    if(isPlaying) {
      showToast('reset');
      return;
    }
    setEpochs(0);
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

  function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  const showToast = (text: string) => {
    toast.error(`Cannot ${text} cells while the game is in play, please stop the game first`, {
      position: 'bottom-right'
    });
  };


  function randomizeLiveCells() {
    if(isPlaying) {
      showToast('randomize');
      return;
    }

    setEpochs(0);
    let randomBoardState = [ ...board ];

    let counter = 0;
    let numAliveCells = getRandomNumber(0, NUM_CELLS) % NUM_CELLS / 2;
    while(counter < numAliveCells) {
      let randomRow = getRandomNumber(0, NUM_ROWS) % NUM_ROWS;
      let randomCol = getRandomNumber(0, NUM_COLS) % NUM_COLS;
      if(randomBoardState[randomRow][randomCol] === 0) {
        randomBoardState[randomRow][randomCol] = 1;
        ++counter;
      }
    }
    setBoardState(randomBoardState);
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className="text-3xl text-center font-mono mt-4">Game of Life</h1>
        <h2>This is an implementation of Conway's Game of Life (GOL) built in React using Next.js. To learn more about GOL, click <Link target="_blank" href="https://en.wikipedia.org/wiki/Conway's_Game_of_Life">here</Link>.</h2>
      </div>
      <div className="flex justify-evenly flex-row items-center">
          <Button className={styles.btn} onClick={nextBoardFunct}>Next</Button>
          <Button className={styles.btn} onClick={() => setIsPlaying(!isPlaying)}>{ isPlaying ? "Stop" : "Play"}</Button>
          <Button className={styles.btn} onClick={clearBoard}>Reset</Button>
          <Button className={styles.btn} onClick={randomizeLiveCells}>Randomize Live Cells</Button>
      </div>
      <div className="flex justify-evenly flex-row items-center">
        <FormGroup row>
          <FormControlLabel control={<Switch defaultChecked name="boundarySwitch" onChange={switchEventHandler} />} label="Enforce Boundaries" />
          <FormControlLabel control={<Switch name="seedSwitch" onChange={switchEventHandler} />} label="Enable Seeds" />
        </FormGroup>
      </div>
      <div className="flex justify-evenly flex-row items-center m-3">
        <p>Epochs: {epochs}</p>
      </div>

      <ToastContainer />

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
