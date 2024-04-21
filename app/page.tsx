"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 800;
const HEIGHT = 800;
const CELL_SIZE = 30;
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

  console.log('boardState: ', boardState);
  const canvasRef = useRef<null | HTMLCanvasElement>(null);

  // make cells come alive
  // compute the next board
  // update the board
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

  return (
    <div>
      <h1 className="text-3xl text-center font-mono mt-4">Game of Life</h1>

      <div className="flex justify-center mt-4">
        <canvas 
          ref={canvasRef}
          width={WIDTH} 
          height={HEIGHT}
          className="bg-gray-900"
      ></canvas>

      </div>
    </div>
  );
}
