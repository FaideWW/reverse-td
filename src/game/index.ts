import produce from "immer";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { DEFAULT_GAME_SETTINGS } from "./constants";
import { initInput } from "./input";
import { loadStage } from "./stage";
import { GameActions, GameSettings, GameState, LoadedGameState } from "./types";

export const useGameStore = create<GameState & GameActions>()(
  devtools((set) => ({
    // State
    stage: null,
    running: false,
    input: initInput(),
    update: () => {
      throw new Error("No stage loaded!");
    },
    draw: () => {
      throw new Error("No stage loaded!");
    },
    canvas: {
      _ctx: null,
      size: [0, 0],
    },
    registerCanvas: (
      ctx: CanvasRenderingContext2D | null,
      width: number,
      height: number
    ) =>
      set(
        produce((game: GameState) => {
          game.canvas._ctx = ctx;
          game.canvas.size = [width, height];
        })
      ),
    settings: DEFAULT_GAME_SETTINGS,
    updateSettings: (newSettings: Partial<GameSettings>) =>
      set(
        produce((game: GameState) => {
          game.settings = { ...game.settings, ...newSettings };
        })
      ),
  }))
);

export function init() {
  useGameStore.setState(
    produce((game: GameState) => {
      const [stage, update, draw] = loadStage(game.canvas.size);
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

export function step(delta: DOMHighResTimeStamp) {
  const game = useGameStore.getState();
  if (!game.running) return;
  useGameStore.setState(
    produce((draft: GameState) => {
      if (gameIsLoaded(draft)) draft.update(draft, delta);
    })
  );

  const nextGame = useGameStore.getState();
  if (gameIsLoaded(nextGame)) nextGame.draw(nextGame);
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
