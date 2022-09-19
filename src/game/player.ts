import { initResources } from "./resources";

import { GameConfig, PlayerState } from "./types";

import { makeScalingValue } from "./util";

export function initPlayer(config: GameConfig): PlayerState {
  return {
    summonReloadRemaining: 0,
    summonReloadTime: makeScalingValue(config.basePlayerSummonReload),
    resources: initResources(config),
  };
}
