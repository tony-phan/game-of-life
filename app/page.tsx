"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 900;
const HEIGHT = 900;
const CELL_SIZE = 100;
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
          onClick={(e) => {
            const x = Math.floor(e.nativeEvent.offsetX / CELL_SIZE);
            const y = Math.floor(e.nativeEvent.offsetY / CELL_SIZE);
            
            let updatedBoardState = [ ...boardState ];
            if(updatedBoardState[x][y] === 0) {
              updatedBoardState[x][y] = 1;
            } else {
              updatedBoardState[x][y] = 0;
            }
            
            setBoardState(updatedBoardState);
          }}
          ref={canvasRef}
          width={WIDTH} 
          height={HEIGHT}
          className="bg-gray-900"
      ></canvas>

      </div>
    </div>
  );
}
