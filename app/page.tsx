"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 900;
const HEIGHT = 900;
const CELL_SIZE = 10;
const NUM_ROWS = WIDTH / CELL_SIZE;
const NUM_COLS = HEIGHT / CELL_SIZE;

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

  const canvasRef = useRef<null | HTMLCanvasElement>(null);

  // create the game ticker
  // create the game controls

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
      if(!inBounds(r + direction[0], c + direction[1])) {
        continue;
      }
      let neighbor = boardState[r + direction[0]][c + direction[1]];
      if(neighbor === 1) {
        ++numAliveNeighbors;
      }
    }
    return numAliveNeighbors;
  }

  function computeNextBoard() {
    let boardCopy = [ ...boardState ];
    for(let r = 0; r < boardState.length; ++r) {
      for(let c = 0; c < boardState[r].length; ++c) {
        let aliveNeighborCount = countNeighbors(r, c);
        
        let newState: number;
        if(boardCopy[r][c] === 0 && aliveNeighborCount === 3) {
          newState = 1;
        } else if(boardCopy[r][c] === 1 && aliveNeighborCount === 2 || aliveNeighborCount === 3) {
          newState = 1;
        } else {
          newState = 0;
        }
        
        boardCopy[r][c] = newState;
      }
    }
    setBoardState(boardCopy);
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
          <button className="py-4" onClick={computeNextBoard}>Next</button>
          <button className="py-4" onClick={clearBoard}>Clear</button>
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
