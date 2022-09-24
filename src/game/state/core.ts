import produce from "immer";
import { StateCreator } from "zustand";
import { DEFAULT_GAME_CONFIG, DEFAULT_GAME_SETTINGS } from "../constants";
import { initInput } from "../input";
import { initPlayer } from "../player";
import {
  GameActions,
  GameConfig,
  GameSettings,
  GameState,
  GameStore,
} from "../types";

const defaultConfig = DEFAULT_GAME_CONFIG;

export const createCoreSlice: StateCreator<
  GameStore,
  [],
  [],
  GameState & GameActions
> = (set) => ({
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
  player: initPlayer(defaultConfig),
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
  config: defaultConfig,
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
      })
    ),
});
