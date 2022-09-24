import { computeMemoryUsed, initResources } from "./resources";

import {
  GameConfig,
  GlobalStatModifiers,
  LoadedGameState,
  PlayerState,
  Upgrade,
  Upgrades,
  UpgradeState,
} from "./types";

import { makeScalingValue, resolveModifiedStat } from "./util";

export function initPlayer(config: GameConfig): PlayerState {
  return {
    stats: {
      summonReload: 0,
      summonReloadTime: config.basePlayerSummonReload,
    },
    resources: initResources(config),
    globalMods: initGlobalMods(),
    upgrades: initUpgrades(config),
  };
}

export function updatePlayer(
  game: LoadedGameState,
  delta: DOMHighResTimeStamp
) {
  const { player } = game;
  updatePlayerStats(game);
  updateResources(game);
  if (player.stats.summonReload > 0) {
    player.stats.summonReload -= delta / 1000;
  }
}

function updateResources(game: LoadedGameState) {
  const { player } = game;
  player.resources.currentMemory = computeMemoryUsed(game);
  player.resources.maxMemory = resolveModifiedStat(
    game.config.basePlayerMaxMemory,
    player.globalMods.player.maxMemory
  );
  player.resources.maxData = resolveModifiedStat(
    game.config.basePlayerMaxData,
    player.globalMods.player.maxData
  );
}

function updatePlayerStats({ player, config }: LoadedGameState) {
  player.stats.summonReloadTime = resolveModifiedStat(
    config.basePlayerSummonReload,
    player.globalMods.player.summonReload
  );
}

function initGlobalMods(): GlobalStatModifiers {
  return {
    player: {
      summonReload: makeScalingValue(),
      maxData: makeScalingValue(),
      maxMemory: makeScalingValue(),
    },
    minion: {
      memoryUsage: makeScalingValue(),
      maxHealth: makeScalingValue(),
      movementSpeed: makeScalingValue(),
      attackSpeed: makeScalingValue(),
      attackDamage: makeScalingValue(),
      attackRange: makeScalingValue(),
      dataGainedPerTileTravelled: makeScalingValue(),
    },
    tower: {
      maxHealth: makeScalingValue(),
      range: makeScalingValue(),
      attackDamage: makeScalingValue(),
      reloadSpeed: makeScalingValue(),
    },
  };
}

function initUpgrades(config: GameConfig): UpgradeState {
  return {
    [Upgrades.MaxData]: createUpgrade(
      config.baseMaxDataUpgradeCost,
      config.baseMaxDataUpgradeCostCoef,
      config.baseMaxDataUpgradeMultiplier
    ),
    [Upgrades.MaxMemory]: createUpgrade(
      config.baseMaxMemoryUpgradeCost,
      config.baseMaxMemoryUpgradeCostCoef,
      config.baseMaxMemoryUpgradeMultiplier
    ),
    [Upgrades.MinionHealth]: createUpgrade(
      config.baseMinionHealthUpgradeCost,
      config.baseMinionHealthUpgradeCostCoef,
      config.baseMinionHealthUpgradeMultiplier
    ),
    [Upgrades.MinionSpeed]: createUpgrade(
      config.baseMinionSpeedUpgradeCost,
      config.baseMinionSpeedUpgradeCostCoef,
      config.baseMinionSpeedUpgradeMultiplier
    ),
  };
}

function createUpgrade(
  baseCost: number,
  nextCostCoef: number,
  nextMultiplier: number
): Upgrade {
  return {
    baseCost,
    numberOwned: 0,
    costCoefficient: nextCostCoef,
    nextUpgradeMultiplier: nextMultiplier,
  };
}
