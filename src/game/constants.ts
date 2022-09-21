import type { GameConfig, GameSettings } from "./types";

export const BASE_PLAYER_SUMMON_RELOAD = 1;
export const BASE_PLAYER_MAX_DATA = 256;
export const BASE_PLAYER_MAX_MEMORY = 4;

export const BASE_MINION_MEMORY_USAGE = 1;
export const BASE_MINION_HEALTH = 5;
export const BASE_MINION_MOVEMENT_SPEED = 1;
export const BASE_MINION_ATTACK_SPEED = 2;
export const BASE_MINION_ATTACK_DAMAGE = 1;
export const BASE_MINION_ATTACK_RANGE = 0.1;
export const BASE_MINION_DATA_GAINED_PER_TILE_TRAVELLED = 0.1;

export const BASE_TOWER_HEALTH = 20;
export const BASE_TOWER_RANGE = 2;
export const BASE_TOWER_ATTACK_DAMAGE = 1;
export const BASE_TOWER_RELOAD = 1;
export const TOWER_LASER_FADEOUT_DURATION = 1;

export const BASE_MAX_MEMORY_UPGRADE_COST = 10;
export const BASE_MAX_MEMORY_UPGRADE_MULTIPLIER = 1.2;
export const BASE_MAX_MEMORY_UPGRADE_COST_COEF = 1.5;
export const BASE_MAX_DATA_UPGRADE_COST = 100;
export const BASE_MAX_DATA_UPGRADE_MULTIPLIER = 1.05;
export const BASE_MAX_DATA_UPGRADE_COST_COEF = 1.2;
export const BASE_MINION_HEALTH_UPGRADE_COST = 10;
export const BASE_MINION_HEALTH_UPGRADE_MULTIPLIER = 1.2;
export const BASE_MINION_HEALTH_UPGRADE_COST_COEF = 1.2;
export const BASE_MINION_SPEED_UPGRADE_COST = 10;
export const BASE_MINION_SPEED_UPGRADE_MULTIPLIER = 1.2;
export const BASE_MINION_SPEED_UPGRADE_COST_COEF = 1.2;

export const MINION_PATHFINDING_OFFSET_DECAY = 0.8;
export const MAPDATA_CHARS_PER_TILE = 2;

export const GOAL_TOWER_ID = "__GOAL__";

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  showFlowField: false,
};

export const DEFAULT_GAME_CONFIG: GameConfig = {
  basePlayerSummonReload: BASE_PLAYER_SUMMON_RELOAD,
  basePlayerMaxData: BASE_PLAYER_MAX_DATA,
  basePlayerMaxMemory: BASE_PLAYER_MAX_MEMORY,
  baseMinionMemoryUsage: BASE_MINION_MEMORY_USAGE,
  baseMinionHealth: BASE_MINION_HEALTH,
  baseMinionMovementSpeed: BASE_MINION_MOVEMENT_SPEED,
  baseMinionAttackSpeed: BASE_MINION_ATTACK_SPEED,
  baseMinionAttackDamage: BASE_MINION_ATTACK_DAMAGE,
  baseMinionAttackRange: BASE_MINION_ATTACK_RANGE,
  baseMinionDataGainedPerTileTravelled:
    BASE_MINION_DATA_GAINED_PER_TILE_TRAVELLED,
  baseTowerHealth: BASE_TOWER_HEALTH,
  baseTowerRange: BASE_TOWER_RANGE,
  baseTowerAttackDamage: BASE_TOWER_ATTACK_DAMAGE,
  baseTowerReload: BASE_TOWER_RELOAD,

  baseMaxDataUpgradeCost: BASE_MAX_DATA_UPGRADE_COST,
  baseMaxDataUpgradeMultiplier: BASE_MAX_DATA_UPGRADE_MULTIPLIER,
  baseMaxDataUpgradeCostCoef: BASE_MAX_DATA_UPGRADE_COST_COEF,

  baseMaxMemoryUpgradeCost: BASE_MAX_MEMORY_UPGRADE_COST,
  baseMaxMemoryUpgradeMultiplier: BASE_MAX_MEMORY_UPGRADE_MULTIPLIER,
  baseMaxMemoryUpgradeCostCoef: BASE_MAX_MEMORY_UPGRADE_COST_COEF,

  baseMinionHealthUpgradeCost: BASE_MINION_HEALTH_UPGRADE_COST,
  baseMinionHealthUpgradeMultiplier: BASE_MINION_HEALTH_UPGRADE_MULTIPLIER,
  baseMinionHealthUpgradeCostCoef: BASE_MINION_HEALTH_UPGRADE_COST_COEF,

  baseMinionSpeedUpgradeCost: BASE_MINION_SPEED_UPGRADE_COST,
  baseMinionSpeedUpgradeMultiplier: BASE_MINION_SPEED_UPGRADE_MULTIPLIER,
  baseMinionSpeedUpgradeCostCoef: BASE_MINION_SPEED_UPGRADE_COST_COEF,
};
