import produce from "immer";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { DEFAULT_GAME_CONFIG, DEFAULT_GAME_SETTINGS } from "./constants";
import { initInput } from "./input";
import { loadStage } from "./stage";
import { llEach } from "./util";
import {
  GameActions,
  GameConfig,
  GameSettings,
  GameState,
  LoadedGameState,
} from "./types";

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
    config: DEFAULT_GAME_CONFIG,
    updateSettings: (newSettings: Partial<GameSettings>) =>
      set(
        produce((game: GameState) => {
          game.settings = { ...game.settings, ...newSettings };
        })
      ),
    updateConfig: (newConfig: Partial<GameConfig>) =>
      set(
        produce((game: GameState) => {
          game.config = { ...game.config, ...newConfig };
          if (gameIsLoaded(game)) {
            // Update player
            game.stage.player.summonReloadTime.base =
              game.config.basePlayerSummonReload;
            // Update minions
            llEach(game.stage.minions, (minion) => {
              minion.maxHealth.base = game.config.baseMinionHealth;
              minion.movementSpeed.base = game.config.baseMinionMovementSpeed;
              minion.attackSpeed.base = game.config.baseMinionAttackSpeed;
            });
            // Update towers
            llEach(game.stage.towers, (tower) => {
              tower.range.base = game.config.baseTowerRange;
              tower.attackDamage.base = game.config.baseTowerShotDamage;
              tower.reloadSpeed.base = game.config.baseTowerReload;
            });
          }
        })
      ),
  }))
);

declare global {
  interface Window {
    getGameState: () => GameState & GameActions;
  }
}

if (process.browser) {
  window.getGameState = useGameStore.getState;
}

export function init() {
  useGameStore.setState(
    produce((game: GameState) => {
      const [stage, update, draw] = loadStage(game);
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
  if (gameIsLoaded(nextGame) && nextGame !== game) nextGame.draw(nextGame);
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
