import { GameMap, Minion, Position, Rect, Stage, TileType } from "./types";
import { findTile, posToStr } from "./util";
import { dot, len, normalize, sub } from "./vector";

// Returns two grids:
//  1. all traversable terrain, where the nodes indicate the shortest path to
//  the goal position.
//  2. all traversable terrain where the nodes represent
//  their distance from the goal position.
export function computeFields(
  tileMap: Record<string, TileType>,
  goal: Position,
  [maxX, maxY]: Position
): [Record<string, Position | null>, Record<string, number>] {
  const frontier: Position[] = [goal];
  const cameFrom: Record<string, Position | null> = {
    [posToStr(goal)]: null,
  };
  const distance: Record<string, number> = {
    [posToStr(goal)]: 0,
  };

  const getNeighbors = ([x, y]: Position): Position[] => {
    const neighbors: Position[] = [];
    if (x > 0 && tileMap[posToStr([x - 1, y])] !== TileType.WALL) {
      neighbors.push([x - 1, y]);
    }
    if (x < maxX - 1 && tileMap[posToStr([x + 1, y])] !== TileType.WALL) {
      neighbors.push([x + 1, y]);
    }
    if (y > 0 && tileMap[posToStr([x, y - 1])] !== TileType.WALL) {
      neighbors.push([x, y - 1]);
    }
    if (y < maxY - 1 && tileMap[posToStr([x, y + 1])] !== TileType.WALL) {
      neighbors.push([x, y + 1]);
    }

    return neighbors;
  };

  // run a flood fill over traversable tiles and identify the direction back to
  // the goal

  while (frontier.length > 0) {
    const current = frontier.shift();
    if (!current) continue;
    const neighbors = getNeighbors(current);
    for (let i = 0; i < neighbors.length; i += 1) {
      const neighbor = neighbors[i];
      if (!neighbor) continue;
      if (!cameFrom[posToStr(neighbor)]) {
        frontier.push(neighbor);
        cameFrom[posToStr(neighbor)] = current;
        distance[posToStr(neighbor)] = (distance[posToStr(current)] || 0) + 1;
      }
    }
  }

  return [cameFrom, distance];
}

// Finds the rect of the spawnable area for this map. The spawnable area must
// be contiguous and rectangular, or this may return an incorrect value.
export function computeSpawnableArea(
  tileMap: Record<string, TileType>,
  [cols, rows]: Position
): Rect {
  const spawnableTile = findTile(tileMap, TileType.SPAWNABLE);
  if (spawnableTile === null) throw new Error("No spawnable tiles found");

  const frontier: Position[] = [spawnableTile];
  const seen: Record<string, boolean> = {
    [posToStr(spawnableTile)]: true,
  };
  let minX = spawnableTile[0];
  let maxX = spawnableTile[0];
  let minY = spawnableTile[1];
  let maxY = spawnableTile[1];

  const getNeighbors = ([x, y]: Position): Position[] => {
    const neighbors: Position[] = [];
    if (x > 0 && tileMap[posToStr([x - 1, y])] === TileType.SPAWNABLE) {
      neighbors.push([x - 1, y]);
    }
    if (x < cols - 1 && tileMap[posToStr([x + 1, y])] === TileType.SPAWNABLE) {
      neighbors.push([x + 1, y]);
    }
    if (y > 0 && tileMap[posToStr([x, y - 1])] === TileType.SPAWNABLE) {
      neighbors.push([x, y - 1]);
    }
    if (y < rows - 1 && tileMap[posToStr([x, y + 1])] === TileType.SPAWNABLE) {
      neighbors.push([x, y + 1]);
    }

    return neighbors;
  };

  // run a flood fill over traversable tiles and identify the direction back to
  // the goal

  while (frontier.length > 0) {
    const current = frontier.shift();
    if (!current) continue;
    const neighbors = getNeighbors(current);
    for (let i = 0; i < neighbors.length; i += 1) {
      const neighbor = neighbors[i];
      if (!neighbor) continue;
      if (!seen[posToStr(neighbor)]) {
        frontier.push(neighbor);
        seen[posToStr(neighbor)] = true;
        if (neighbor[0] < minX) minX = neighbor[0];
        if (neighbor[0] > maxX) maxX = neighbor[0];
        if (neighbor[1] < minY) minY = neighbor[1];
        if (neighbor[1] > maxY) maxY = neighbor[1];
      }
    }
  }

  return {
    xy: [minX, minY],
    size: [maxX - minX + 1, maxY - minY + 1],
  };
}

export function findNextWaypoint(map: GameMap, pos: Position): Position | null {
  const nearestWaypoint = findNearestWaypoint(map, pos);
  const nextWaypoint = map.flowField[posToStr(nearestWaypoint)];
  if (!nextWaypoint) return null;
  return nextWaypoint;
}

export function findNearestWaypoint(_map: GameMap, [x, y]: Position): Position {
  // This will be more sophisticated in the future, but for the sake of
  // prototyping we will just find the closest tile

  return [Math.round(x), Math.round(y)];
}

// Returns the distance (as a value between 0 and 1) along the waypoint vector
// the given position is
export function computeWaypointProgress(
  start: Position,
  end: Position,
  xy: Position
): number {
  const waypointVector = normalize(sub(end, start));
  const posVector = sub(xy, start);
  return dot(posVector, waypointVector);
}

// Progress is defined as: the distance from the goal, as measured by pathfinding waypoints. A lower score = closer to the goal.
// Full integers indicate the number of waypoints away from the goal the position is, and fractions indicate how far the position is along the way to the next waypoint.
//
export function computePathfindingProgress(minion: Minion, map: GameMap) {
  const nextWaypoint = minion.pathfinding.nextWaypoint;
  const lastWaypoint = minion.pathfinding.lastWaypoint;

  // If either waypoint is null we assume the minion has reached the goal.
  if (nextWaypoint === null || lastWaypoint === null) return 0;

  const waypointDistance = map.distanceField[posToStr(nextWaypoint)] || 0;
  // We want progress defined from next to last, so that the closer the minion
  // is to next, the lower the "progress" score is.
  const waypointProgress = computeWaypointProgress(
    nextWaypoint,
    lastWaypoint,
    minion.xy
  );

  return waypointDistance + waypointProgress;
}

export function findMostProgressedMinionInRange(
  { minions, map }: Stage,
  xy: Position,
  range: number
): string | null {
  let mostProgressed = null;
  let bestProgress = Infinity;
  let minionNode = minions;
  while (minionNode !== null) {
    const minion = minionNode.value;

    const distance = len(sub(minion.xy, xy));
    if (distance <= range) {
      if (mostProgressed === null) {
        mostProgressed = minion.id;
        bestProgress = computePathfindingProgress(minion, map);
      } else {
        const minionProgress = computePathfindingProgress(minion, map);
        if (minionProgress < bestProgress) {
          mostProgressed = minion.id;
          bestProgress = minionProgress;
        }
      }
    }

    minionNode = minionNode.next;
  }

  return mostProgressed;
}
