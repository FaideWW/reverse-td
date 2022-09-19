import { GameConfig, Minion, ResourceState } from "./types";
import { makeScalingValue, resolve } from "./util";

export function initResources(config: GameConfig): ResourceState {
  return {
    currentData: 0,
    maxData: makeScalingValue(config.basePlayerMaxData),
  };
}

export function computeMinionDataGain(minion: Minion): number {
  const dataPerTile = resolve(minion.dataGain);
  return dataPerTile * Math.floor(minion.distanceTravelled);
}
