// Updates a minion's logic and physics, and returns whether the minion should

import { nanoid } from "nanoid";
import { GOAL_TOWER_ID, MINION_PATHFINDING_OFFSET_DECAY } from "./constants";
import { findNextWaypoint } from "./pathfinding";
import type {
  GameConfig,
  GameMap,
  LoadedGameState,
  MakeOptional,
  Minion,
  MinionStatModifiers,
  Position,
  Rect,
} from "./types";
import { MinionBehavior } from "./types";
import {
  makeScalingValue,
  pointInRect,
  tileRect,
  llFind,
  llRemove,
  resolveModifiedStat,
} from "./util";
import { add, distanceToRect, len, normalize, smul, sub } from "./vector";

type CreateMinionParam = MakeOptional<Minion, "xy">;

export function createMinion(
  params: CreateMinionParam,
  config: GameConfig
): Minion {
  // Ensure we don't copy a reference into the minion
  const tileCenter: Position = [
    Math.round(params.xy[0]),
    Math.round(params.xy[1]),
  ];
  const tileOffset: Position = smul(
    sub(params.xy, tileCenter),
    MINION_PATHFINDING_OFFSET_DECAY
  );
  const minionMaxHealth = params.stats?.maxHealth ?? config.baseMinionHealth;

  const localStatMods: MinionStatModifiers = {
    memoryUsage: makeScalingValue(),
    maxHealth: makeScalingValue(),
    movementSpeed: makeScalingValue(),
    attackSpeed: makeScalingValue(),
    attackDamage: makeScalingValue(),
    attackRange: makeScalingValue(),
    dataGainedPerTileTravelled: makeScalingValue(),
  };
  return {
    id: params.id ?? nanoid(),
    xy: params.xy,
    localStatMods,
    stats: {
      health: params.stats?.health ?? minionMaxHealth,
      maxHealth: minionMaxHealth,
      movementSpeed:
        params.stats?.movementSpeed ?? config.baseMinionMovementSpeed,
      attackSpeed: params.stats?.attackSpeed ?? config.baseMinionAttackSpeed,
      attackDamage: params.stats?.attackDamage ?? config.baseMinionAttackDamage,
      attackRange: params.stats?.attackRange ?? config.baseMinionAttackRange,
      reload: params.stats?.reload ?? 0,
      dataGainedPerTileTravelled:
        params.stats?.dataGainedPerTileTravelled ??
        config.baseDataGainedPerTileTravelled,
    },
    pathfinding: {
      tileOffset,
      lastWaypoint: null,
      nextWaypoint: null,
    },
    dataGain:
      params.dataGain ??
      makeScalingValue(config.baseDataGainedPerTileTravelled),
    distanceTravelled: params.distanceTravelled ?? 0,
    behavior: params.behavior ?? MinionBehavior.Marching,
    attackTargetId: null,
  };
}

// Returns a Rect that can be used to determine if a minion is offscreen
function getMinionBoundaryRect(map: GameMap): Rect {
  // For now we allow minions to exceed the map boundary by up to one tile, to
  // allow them to move entirely offscreen before they despawn
  return {
    xy: [-1, -1],
    size: add(map.mapSize, [2, 2]),
  };
}

// Updates a minion and returns whether or not it should
// be freed (because it has died or is otherwise destroyed)
export function updateMinion(
  minion: Minion,
  game: LoadedGameState,
  delta: DOMHighResTimeStamp
): boolean {
  updateMinionStats(minion, game);

  doBehavior(minion, game, delta);

  if (
    !pointInRect(minion.xy, getMinionBoundaryRect(game.stage.map)) ||
    minion.stats.health <= 0
  ) {
    // TODO: Run minion on-death effects
    return true;
  }
  return false;
}

export function updateMinionStats(minion: Minion, game: LoadedGameState) {
  minion.stats.maxHealth = resolveModifiedStat(
    game.config.baseMinionHealth,
    game.player.globalMods.minion.maxHealth,
    minion.localStatMods.maxHealth
  );
  minion.stats.movementSpeed = resolveModifiedStat(
    game.config.baseMinionMovementSpeed,
    game.player.globalMods.minion.movementSpeed,
    minion.localStatMods.movementSpeed
  );

  minion.stats.attackSpeed = resolveModifiedStat(
    game.config.baseMinionAttackSpeed,
    game.player.globalMods.minion.attackSpeed,
    minion.localStatMods.attackSpeed
  );
  minion.stats.attackDamage = resolveModifiedStat(
    game.config.baseMinionAttackDamage,
    game.player.globalMods.minion.attackDamage,
    minion.localStatMods.attackDamage
  );
  minion.stats.attackRange = resolveModifiedStat(
    game.config.baseMinionAttackRange,
    game.player.globalMods.minion.attackRange,
    minion.localStatMods.attackRange
  );
}

export function doBehavior(
  minion: Minion,
  game: LoadedGameState,
  delta: DOMHighResTimeStamp
) {
  switch (minion.behavior) {
    case MinionBehavior.Idle:
      break;
    case MinionBehavior.Staging:
      break;
    case MinionBehavior.Marching:
      doPathfinding(minion, game, delta);
      if (
        distanceToRect(minion.xy, tileRect(game.stage.map.goal)) <
        minion.stats.attackRange
      ) {
        minion.behavior = MinionBehavior.Attacking;
        minion.attackTargetId = GOAL_TOWER_ID;
        console.log(`minion ${minion.id} has reached goal; attacking`);
      }
      break;
    case MinionBehavior.Attacking:
      doAttack(minion, game, delta);
      break;
  }
  return;
}

function doPathfinding(
  minion: Minion,
  { stage }: LoadedGameState,
  delta: DOMHighResTimeStamp
) {
  // If we don't have a next waypoint, assume we are done.
  if (!minion.pathfinding.nextWaypoint) return;

  // Follow the waypoint towards the goal.
  const waypointPosition = add(
    minion.pathfinding.nextWaypoint,
    minion.pathfinding.tileOffset
  );
  const direction = sub(waypointPosition, minion.xy);

  const movement = smul(normalize(direction), minion.stats.movementSpeed);
  const increment = smul(movement, delta / 1000);

  let finalMovement = increment;

  const lenDirection = len(direction);
  const lenIncrement = len(increment);
  // We've reached the waypoint, find the next one and add the remaining
  // delta movement towards the new waypoint
  if (lenDirection <= lenIncrement) {
    finalMovement = direction;
    const remaining = lenIncrement - lenDirection;

    minion.pathfinding.lastWaypoint = minion.pathfinding.nextWaypoint;
    minion.pathfinding.nextWaypoint = findNextWaypoint(stage.map, minion.xy);

    if (minion.pathfinding.nextWaypoint !== null) {
      const nextWaypointPosition = add(
        minion.pathfinding.nextWaypoint,
        minion.pathfinding.tileOffset
      );
      const nextDirection = sub(nextWaypointPosition, minion.xy);

      const nextMovement = smul(
        normalize(nextDirection),
        minion.stats.movementSpeed
      );
      const nextIncrement = smul(nextMovement, remaining);

      finalMovement = add(finalMovement, nextIncrement);
    }
  }

  minion.xy = add(minion.xy, finalMovement);
  if (!pointInRect(minion.xy, stage.map.spawnableArea)) {
    minion.distanceTravelled += len(finalMovement);
  }
}

function doAttack(
  minion: Minion,
  game: LoadedGameState,
  delta: DOMHighResTimeStamp
) {
  const { stage } = game;
  // Update minion attack
  if (minion.stats.reload > 0) minion.stats.reload -= delta / 1000;

  if (minion.attackTargetId !== null && minion.stats.reload <= 0) {
    const target = llFind(
      stage.towers,
      (tower) => tower.id === minion.attackTargetId
    );
    if (target && target.stats.health > 0) {
      // TODO: Play attack animation/sound
      target.stats.health -= minion.stats.attackDamage;
      if (target.stats.health <= 0) {
        // TODO: destroy tower

        stage.towers = llRemove(
          stage.towers,
          (tower) => tower.id === target.id
        );
        minion.attackTargetId = null;
        minion.behavior = MinionBehavior.Idle;

        if (target.id === GOAL_TOWER_ID) {
          // TODO: Advance to the next map
        }
      }

      // Adding instead of setting ensures we don't accumulate rounding error
      // from the frametime delta. Not doing this would cause firing rate to be
      // slightly off
      minion.stats.reload += minion.stats.attackSpeed;
    } else {
      minion.behavior = MinionBehavior.Idle;
    }
  }
}
