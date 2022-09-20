import produce from "immer";
import { MouseEvent } from "react";
import { useGameStore } from ".";
import type { InputState, GameState } from "./types";

enum MouseButtons {
  LEFT = 0,
  WHEEL = 1,
  RIGHT = 2,
  MOUSE3 = 3,
  MOUSE4 = 4,
}

export function initInput(): InputState {
  return {
    mouse: { xy: [0, 0], left: false, right: false },
  };
}

export function handleMouseDown(e: MouseEvent<HTMLCanvasElement>) {
  useGameStore.setState(
    produce((game: GameState) => {
      if (e.button === MouseButtons.LEFT) {
        game.input.mouse.left = true;
      } else if (e.button === MouseButtons.RIGHT) {
        game.input.mouse.right = true;
      }
    })
  );
}

export function handleMouseUp(e: MouseEvent<HTMLCanvasElement>) {
  useGameStore.setState(
    produce((game: GameState) => {
      if (e.button === MouseButtons.LEFT) {
        game.input.mouse.left = false;
      } else if (e.button === MouseButtons.RIGHT) {
        game.input.mouse.right = false;
      }
    })
  );
}

export function handleMouseMove(e: MouseEvent<HTMLCanvasElement>) {
  useGameStore.setState(
    produce((game: GameState) => {
      game.input.mouse.xy[0] = e.nativeEvent.offsetX;
      game.input.mouse.xy[1] = e.nativeEvent.offsetY;
    })
  );
}
