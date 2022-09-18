import { GameSettings } from "./types";

export const BASE_PLAYER_SUMMON_RELOAD = 1;
export const BASE_MINION_HEALTH = 5;
export const BASE_MINION_MOVEMENT_SPEED = 2;
export const BASE_MINION_ATTACK_SPEED = 2;

export const BASE_TOWER_RANGE = 2;
export const BASE_TOWER_SHOT_DAMAGE = 1;
export const BASE_TOWER_RELOAD = 1;
export const TOWER_LASER_FADEOUT_DURATION = 1;

export const MINION_PATHFINDING_OFFSET_DECAY = 0.8;
export const MAPDATA_CHARS_PER_TILE = 2;

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  showFlowField: false,
};
