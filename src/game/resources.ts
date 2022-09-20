import type { GameConfig, Minion, ResourceState } from "./types";
import { makeScalingValue, resolve } from "./util";

export function initResources(config: GameConfig): ResourceState {
  return {
    currentMemory: 0,
    maxMemory: makeScalingValue(config.basePlayerMaxMemory),
    currentData: 0,
    maxData: makeScalingValue(config.basePlayerMaxData),
  };
}

export function computeMinionDataGain(minion: Minion): number {
  const dataPerTile = resolve(minion.dataGain);
  return dataPerTile * Math.floor(minion.distanceTravelled);
}
