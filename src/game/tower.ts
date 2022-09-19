import { Tower, Stage } from "./types";
import { sub, len } from "./vector";
import { llFind, resolve } from "./util";
import { findMostProgressedMinionInRange } from "./pathfinding";

// Updates a tower's tracking information, including finding a new tracking
// target if the current one no longer exists or is out of range
export function trackMinion(stage: Stage, tower: Tower): void {
  let newTargetRequired = true;

  if (tower.trackingMinionId) {
    const trackedMinion = llFind(
      stage.minions,
      (minion) => minion.id === tower.trackingMinionId
    );
    if (trackedMinion && trackedMinion.health > 0) {
      // Update facing angle
      const vector = sub(trackedMinion.xy, tower.xy);
      if (len(vector) <= resolve(tower.range)) {
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
      resolve(tower.range)
    );
  }
}
