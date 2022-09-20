import type {
  GameConfig,
  LoadedGameState,
  Minion,
  ResourceState,
} from "./types";
import { llReduce, resolve, resolveModifiedStat } from "./util";

export function initResources(config: GameConfig): ResourceState {
  return {
    currentMemory: 0,
    maxMemory: config.basePlayerMaxMemory,
    currentData: 0,
    maxData: config.basePlayerMaxData,
  };
}

export function computeMinionDataGain(minion: Minion): number {
  const dataPerTile = resolve(minion.dataGain);
  return dataPerTile * Math.floor(minion.distanceTravelled);
}

export function computeMemoryUsed(game: LoadedGameState): number {
  return llReduce(
    game.stage.minions,
    (sum, minion) => sum + minion.stats.memoryUsage,
    0
  );
}

export function computeNextMinionMemoryRequired({
  player,
  config,
}: LoadedGameState): number {
  return resolveModifiedStat(
    config.baseMinionMemoryUsage,
    player.globalMods.minion.memoryUsage
  );
}
