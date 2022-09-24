import produce from "immer";
import create from "zustand";
import testMapEasy from "./maps/testMapEasy";
import { loadStage } from "./stage";
import { createCoreSlice } from "./state/core";
import { createResourceActionsSlice } from "./state/resources";
import type { GameState, GameStore, LoadedGameState } from "./types";
export const useGameStore = create<GameStore>()((...a) => ({
  ...createCoreSlice(...a),
  ...createResourceActionsSlice(...a),
}));

declare global {
  interface Window {
    getGameState: () => GameStore;
  }
}

if (process.browser) {
  window.getGameState = useGameStore.getState;
}

export function init() {
  useGameStore.setState(
    produce((game: GameState) => {
      const [stage, update, draw] = loadStage(game, new Date(), testMapEasy);
      game.stage = stage;
      game.update = update;
      game.draw = draw;
    })
  );
}

export function start() {
  useGameStore.setState(
    produce((game: GameState) => {
      game.running = true;
    })
  );
}

export function stop() {
  useGameStore.setState(
    produce((game: GameState) => {
      game.running = false;
    })
  );
}

export function draw() {
  const game = useGameStore.getState();
  if (gameIsLoaded(game)) {
    game.draw(game);
  }
}

export function step(delta: DOMHighResTimeStamp) {
  const game = useGameStore.getState();
  if (!game.running) return;
  useGameStore.setState(
    produce((draft: GameState) => {
      if (gameIsLoaded(draft)) draft.update(draft, delta);
    })
  );

  const nextGame = useGameStore.getState();
  if (gameIsLoaded(nextGame) && nextGame !== game) {
    nextGame.draw(nextGame);
  }
  // useGameStore.setState(
  //   produce((game: GameState) => {
  //     if (!game.running) return;

  //     if (gameIsLoaded(game)) {
  //       game.update(game, delta);
  //       game.draw(game);
  //     }
  //   })
  // );
}

function gameIsLoaded(game: GameState): game is LoadedGameState {
  return game.stage !== null && game.canvas._ctx !== null;
}
