import { nanoid } from "nanoid";
import { TOWER_LASER_FADEOUT_DURATION } from "./constants";
import { findMostProgressedMinionInRange } from "./pathfinding";
import { computeMinionDataGain } from "./resources";
import { shootLaser } from "./stage";
import type {
  GameConfig,
  LoadedGameState,
  MakeOptional,
  Stage,
  Tower,
  TowerStatModifiers,
} from "./types";
import { TowerType } from "./types";
import {
  llFind,
  llInsert,
  llRemove,
  makeScalingValue,
  resolve,
  resolveModifiedStat,
} from "./util";
import { len, sub } from "./vector";

type CreateTowerParam = MakeOptional<Tower, "type" | "xy">;

export function createTower(
  params: CreateTowerParam,
  config: GameConfig
): Tower {
  const maxHealth = params.stats?.maxHealth ?? config.baseTowerHealth;

  const localStatMods: TowerStatModifiers = {
    maxHealth: makeScalingValue(),
    range: makeScalingValue(),
    reloadSpeed: makeScalingValue(),
    attackDamage: makeScalingValue(),
  };
  return {
    xy: params.xy,
    type: params.type,
    id: params.id ?? nanoid(),
    localStatMods,
    stats: {
      reload: params.stats?.reload ?? 0,
      health: params.stats?.health ?? maxHealth,
      maxHealth: maxHealth,
      range: params.stats?.range ?? config.baseTowerRange,
      reloadSpeed: params.stats?.reloadSpeed ?? config.baseTowerReload,
      attackDamage: params.stats?.attackDamage ?? config.baseTowerAttackDamage,
    },
    facingAngle: params.facingAngle ?? 0,
    trackingMinionId: params.trackingMinionId ?? null,
  };
}

// Updates a tower and returns whether or not it should
// be freed (because it has died or is otherwise destroyed)
export function updateTower(
  tower: Tower,
  game: LoadedGameState,
  delta: DOMHighResTimeStamp
): boolean {
  updateTowerStats(tower, game);

  switch (tower.type) {
    case TowerType.Basic:
      doTracking(tower, game.stage);
      doAttack(tower, game, delta);
      break;
    case TowerType.Goal:
      break;
    default:
      break;
  }

  return false;
}

function updateTowerStats(tower: Tower, game: LoadedGameState) {
  tower.stats.maxHealth = resolveModifiedStat(
    game.config.baseTowerHealth,
    game.player.globalMods.tower.maxHealth,
    tower.localStatMods.maxHealth
  );
  tower.stats.range = resolveModifiedStat(
    game.config.baseTowerRange,
    game.player.globalMods.tower.range,
    tower.localStatMods.range
  );
  tower.stats.reloadSpeed = resolveModifiedStat(
    game.config.baseTowerReload,
    game.player.globalMods.tower.reloadSpeed,
    tower.localStatMods.reloadSpeed
  );
  tower.stats.attackDamage = resolveModifiedStat(
    game.config.baseTowerAttackDamage,
    game.player.globalMods.tower.attackDamage,
    tower.localStatMods.attackDamage
  );
}

// Updates a tower's tracking information, including finding a new tracking
// target if the current one no longer exists or is out of range
function doTracking(tower: Tower, stage: Stage): void {
  let newTargetRequired = true;

  if (tower.trackingMinionId) {
    const trackedMinion = llFind(
      stage.minions,
      (minion) => minion.id === tower.trackingMinionId
    );
    if (trackedMinion && trackedMinion.stats.health > 0) {
      // Update facing angle
      const vector = sub(trackedMinion.xy, tower.xy);
      if (len(vector) <= tower.stats.range) {
        tower.facingAngle = Math.atan2(vector[1], vector[0]);
        newTargetRequired = false;
      } else {
        tower.trackingMinionId = null;
      }
    }
  }

  if (newTargetRequired) {
    // Scan for a minion to track, sort by furthest progressed
    tower.trackingMinionId = findMostProgressedMinionInRange(
      stage,
      tower.xy,
      tower.stats.range
    );
  }
}

function doAttack(
  tower: Tower,
  { stage, player }: LoadedGameState,
  delta: DOMHighResTimeStamp
) {
  // Update tower attack
  if (tower.stats.reload > 0) tower.stats.reload -= delta / 1000;

  if (tower.trackingMinionId !== null && tower.stats.reload <= 0) {
    const trackedMinion = llFind(
      stage.minions,
      (minion) => minion.id === tower.trackingMinionId
    );
    if (trackedMinion) {
      // TODO: Play attack animation/sound
      trackedMinion.stats.health -= tower.stats.attackDamage;
      stage.laserTrails = llInsert(
        stage.laserTrails,
        shootLaser(tower.xy, trackedMinion.xy, TOWER_LASER_FADEOUT_DURATION)
      );
      if (trackedMinion.stats.health <= 0) {
        // TODO: Destroy minion

        console.log("Minion died!", JSON.stringify(trackedMinion, null, 2));
        player.resources.currentData += computeMinionDataGain(trackedMinion);
        console.log(
          `Gained ${computeMinionDataGain(trackedMinion)} data (${
            trackedMinion.distanceTravelled
          } tiles travelled)`
        );
        if (player.resources.currentData > player.resources.maxData) {
          player.resources.currentData = player.resources.maxData;
        }

        stage.minions = llRemove(
          stage.minions,
          (minion) => minion.id === trackedMinion.id
        );
        tower.trackingMinionId = null;
      }

      // Adding instead of setting ensures we don't accumulate rounding error
      // from the frametime delta. Not doing this would cause firing rate to be
      // slightly off
      tower.stats.reload += tower.stats.reloadSpeed;
    }
  }
}
