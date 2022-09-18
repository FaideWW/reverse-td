import { nanoid } from "nanoid";
import {
  BASE_MINION_ATTACK_SPEED,
  BASE_MINION_HEALTH,
  BASE_MINION_MOVEMENT_SPEED,
  BASE_PLAYER_SUMMON_RELOAD,
  BASE_TOWER_RANGE,
  BASE_TOWER_RELOAD,
  BASE_TOWER_SHOT_DAMAGE,
  MAPDATA_CHARS_PER_TILE,
  MINION_PATHFINDING_OFFSET_DECAY,
  TOWER_LASER_FADEOUT_DURATION,
} from "./constants";
import {
  clearCanvas,
  drawCircle,
  drawLine,
  drawLineGroup,
  drawRect,
} from "./draw";
import testMap from "./maps/testMap";
import {
  computeFields,
  computeSpawnableArea,
  findNextWaypoint,
} from "./pathfinding";
import { trackMinion } from "./tower";
import {
  ColorRGBA,
  Dimension,
  DrawDelegate,
  GameMap,
  LaserTrail,
  ListNode,
  LoadedGameState,
  Minion,
  PlayerState,
  Position,
  Stage,
  TileType,
  Tower,
  TowerType,
  UpdateDelegate,
} from "./types";
import {
  canvasToWorldTransform,
  findTile,
  llFind,
  llInsert,
  llRemove,
  pointInRect,
  posToStr,
  strToPos,
  worldToCanvasTransform,
} from "./util";
import { add, len, normalize, sdiv, smul, sub, vmul } from "./vector";

export function loadStage(
  canvasSize: Dimension
): [Stage, UpdateDelegate, DrawDelegate] {
  const [map, towers] = importMap(canvasSize);
  const stage: Stage = {
    minions: null,
    towers,
    map,
    timeElapsed: 0,
    player: {
      summonReloadRemaining: 0,
      summonReloadTime: BASE_PLAYER_SUMMON_RELOAD,
    },
    laserTrails: null,
  };
  console.log(stage);

  return [stage, update, draw];
}

function getTile(tileId: number): TileType {
  switch (tileId) {
    case 0:
      return TileType.OPEN;
    case 1:
      return TileType.GOAL;
    case 2:
      return TileType.WALL;
    case 3:
      return TileType.SPAWNABLE;
    default:
      return TileType.OPEN;
  }
}

export function importMap([canvasWidth, canvasHeight]: Dimension): [
  GameMap,
  ListNode<Tower> | null
] {
  const trimmedMap = testMap.trim().split("\n");
  const tileMap: Record<string, TileType> = {};
  const rows = trimmedMap.length;
  const cols = (trimmedMap[0]?.length || 0) / MAPDATA_CHARS_PER_TILE;

  let towerListHead: ListNode<Tower> | null = null;

  for (let y = 0; y < trimmedMap.length; y += 1) {
    const row = trimmedMap[y] || [];
    for (let x = 0; x < row.length; x += MAPDATA_CHARS_PER_TILE) {
      // Each tile is encoded as 2 characters; the first is the tile type, the second is any tile metadata (eg. a wall might have a turret on it)
      const tileChar = row[x] || "0";
      const tileMetadata = row[x + 1] || "0";

      const tile = getTile(Number(tileChar));

      if (tile === TileType.WALL && Number(tileMetadata) === 1) {
        towerListHead = llInsert(towerListHead, createTower([x / 2, y]));
      }

      tileMap[posToStr([x / 2, y])] = tile;
    }
  }

  const goal = findTile(tileMap, TileType.GOAL);
  if (!goal) throw new Error("No goal found on map");

  const [flowField, distanceField] = computeFields(tileMap, goal, [cols, rows]);
  const spawnableArea = computeSpawnableArea(tileMap, [cols, rows]);

  return [
    {
      tiles: tileMap,
      mapSize: [cols, rows],
      tileSize: [canvasWidth / cols, canvasHeight / rows],
      goal,
      flowField,
      distanceField,
      spawnableArea,
    },
    towerListHead,
  ];
}

export function createMinion(pos: Position): Minion {
  // Ensure we don't copy a reference into the minion
  const xy: Position = [pos[0], pos[1]];
  const tileCenter: Position = [Math.round(pos[0]), Math.round(pos[1])];
  const tileOffset: Position = smul(
    sub(xy, tileCenter),
    MINION_PATHFINDING_OFFSET_DECAY
  );
  console.log("minion", xy, tileOffset);
  return {
    id: nanoid(),
    xy,
    health: BASE_MINION_HEALTH,
    movementSpeed: BASE_MINION_MOVEMENT_SPEED,
    attackSpeed: BASE_MINION_ATTACK_SPEED,
    pathfinding: {
      tileOffset,
      lastWaypoint: null,
      nextWaypoint: null,
    },
  };
}

export function createTower(xy: Position): Tower {
  return {
    id: nanoid(),
    xy,
    type: TowerType.Basic,
    range: BASE_TOWER_RANGE,
    reload: 0,
    reloadSpeed: BASE_TOWER_RELOAD,
    attackDamage: BASE_TOWER_SHOT_DAMAGE,
    trackingMinionId: null,
    facingAngle: 0,
  };
}

export function update(game: LoadedGameState, delta: DOMHighResTimeStamp) {
  handleInput(game);

  handlePlayer(game.stage.player, delta);

  updateMinions(game, delta);
  updateTowers(game, delta);
  updateLaserTrails(game, delta);
}

export function handleInput({ stage, input }: LoadedGameState) {
  if (input.mouse.left) {
    if (stage.player.summonReloadRemaining === 0) {
      // Clearing the input inside the summon branch gives a minor gamefeel
      // improvement, allowing you to buffer a click slightly before the reload
      // timer expires and have the spawn trigger immediately.
      input.mouse.left = false;
      const worldMouse = canvasToWorldTransform(
        stage.map.tileSize,
        input.mouse.xy
      );
      if (!pointInRect(worldMouse, stage.map.spawnableArea)) return;

      const minion = createMinion(worldMouse);
      minion.pathfinding.lastWaypoint = worldMouse;
      minion.pathfinding.nextWaypoint = findNextWaypoint(stage.map, minion.xy);
      stage.minions = llInsert(stage.minions, minion);

      stage.player.summonReloadRemaining = stage.player.summonReloadTime;
    }
  }
}

export function handlePlayer(player: PlayerState, delta: DOMHighResTimeStamp) {
  player.summonReloadRemaining -= delta / 1000;
  if (player.summonReloadRemaining < 0) player.summonReloadRemaining = 0;
}

export function updateMinions(
  { stage }: LoadedGameState,
  delta: DOMHighResTimeStamp
) {
  let minionNode = stage.minions;
  while (minionNode !== null) {
    const minion = minionNode.value;

    // If we don't have a next waypoint, assume we are done.
    if (!minion.pathfinding.nextWaypoint) continue;

    // Follow the waypoint towards the goal.
    const waypointPosition = add(
      minion.pathfinding.nextWaypoint,
      minion.pathfinding.tileOffset
    );
    const direction = sub(waypointPosition, minion.xy);

    const movement = smul(normalize(direction), minion.movementSpeed);
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
          minion.movementSpeed
        );
        const nextIncrement = smul(nextMovement, remaining);

        finalMovement = add(finalMovement, nextIncrement);
      }
    }

    minion.xy = add(minion.xy, finalMovement);

    minionNode = minionNode.next;
  }
}

export function shootLaser(
  towerXY: Position,
  minionXY: Position,
  timeToLive: number
): LaserTrail {
  return {
    sourceXY: towerXY,
    targetXY: minionXY,
    lifetime: timeToLive,
    maxLifetime: timeToLive,
  };
}

export function updateTowers(
  { stage }: LoadedGameState,
  delta: DOMHighResTimeStamp
) {
  let towerNode = stage.towers;
  while (towerNode !== null) {
    const tower = towerNode.value;

    trackMinion(stage, tower);

    // Update tower attack
    if (tower.reload > 0) tower.reload -= delta / 1000;

    if (tower.trackingMinionId !== null && tower.reload <= 0) {
      const trackedMinion = llFind(
        stage.minions,
        (minion) => minion.id === tower.trackingMinionId
      );
      if (trackedMinion) {
        // TODO: Play attack animation/sound
        trackedMinion.health -= tower.attackDamage;
        stage.laserTrails = llInsert(
          stage.laserTrails,
          shootLaser(tower.xy, trackedMinion.xy, TOWER_LASER_FADEOUT_DURATION)
        );
        if (trackedMinion.health <= 0) {
          // TODO: Destroy minion
          stage.minions = llRemove(
            stage.minions,
            (minion) => minion.id === trackedMinion.id
          );
          tower.trackingMinionId = null;
        }
        tower.reload = tower.reloadSpeed;
      }
    }

    towerNode = towerNode.next;
  }
}

export function updateLaserTrails(
  { stage }: LoadedGameState,
  delta: DOMHighResTimeStamp
) {
  let lastLaser = null;
  let laserTrailNode = stage.laserTrails;
  while (laserTrailNode !== null) {
    const laserTrail = laserTrailNode.value;
    laserTrail.lifetime -= delta / 1000;

    if (laserTrail.lifetime <= 0) {
      if (lastLaser === null) {
        stage.laserTrails = laserTrailNode.next;
      } else {
        lastLaser.next = laserTrailNode.next;
      }
    }

    lastLaser = laserTrailNode;
    laserTrailNode = laserTrailNode.next;
  }
}

export function draw(game: LoadedGameState) {
  clearCanvas(game.canvas._ctx);

  drawGoal(game);
  drawWalls(game);
  drawMinions(game);
  drawTowers(game);
  drawSpawnableArea(game);
  drawLaserTrails(game);

  // Debug stuff
  if (game.settings.showFlowField) {
    drawFlowField(game);
  }
}

const green: ColorRGBA = [0, 255, 0, 1];
const red: ColorRGBA = [255, 0, 0, 1];
const blue: ColorRGBA = [0, 0, 255, 1];
const white: ColorRGBA = [255, 255, 255, 1];

function drawGoal({ stage, canvas }: LoadedGameState) {
  const [x, y] = worldToCanvasTransform(stage.map.tileSize, stage.map.goal);
  const [tileW, tileH] = stage.map.tileSize;
  drawRect(canvas._ctx, x - tileW / 2, y - tileH / 2, tileW, tileH, green);
}

function drawWalls({ stage, canvas }: LoadedGameState) {
  const { map } = stage;
  const [maxX, maxY] = map.mapSize;
  const [tileW, tileH] = map.tileSize;
  for (let y = 0; y < maxY; y += 1) {
    for (let x = 0; x < maxX; x += 1) {
      const tile = map.tiles[posToStr([x, y])];
      if (tile === TileType.WALL) {
        const [wx, wy] = worldToCanvasTransform(stage.map.tileSize, [x, y]);
        drawRect(
          canvas._ctx,
          wx - tileW / 2,
          wy - tileH / 2,
          tileW,
          tileH,
          blue
        );
      }
    }
  }
}

function drawMinions({ stage, canvas }: LoadedGameState) {
  const minionSize = 6;
  let minionNode = stage.minions;
  while (minionNode !== null) {
    const minion = minionNode.value;
    const [x, y] = worldToCanvasTransform(stage.map.tileSize, minion.xy);
    drawRect(
      canvas._ctx,
      x - minionSize / 2,
      y - minionSize / 2,
      minionSize,
      minionSize,
      white
    );

    minionNode = minionNode.next;
  }
}

const cyan: ColorRGBA = [0, 255, 255, 1];
const black: ColorRGBA = [0, 0, 0, 1];
function drawTowers({ stage, canvas }: LoadedGameState) {
  let towerNode = stage.towers;
  while (towerNode !== null) {
    const tower = towerNode.value;
    const [x, y] = worldToCanvasTransform(stage.map.tileSize, tower.xy);
    const towerSize = 8;
    drawCircle(canvas._ctx, x, y, towerSize, cyan);

    const turretVector = smul(
      [Math.cos(tower.facingAngle), Math.sin(tower.facingAngle)],
      12
    );
    drawLine(canvas._ctx, x, y, x + turretVector[0], y + turretVector[1], {
      color: black,
      lineWidth: 3,
    });

    towerNode = towerNode.next;
  }
}

function drawSpawnableArea({ stage, canvas }: LoadedGameState) {
  const semiWhite: ColorRGBA = [255, 255, 255, 0.2];
  const [x, y] = worldToCanvasTransform(
    stage.map.tileSize,
    stage.map.spawnableArea.xy
  );

  const [w, h] = vmul(stage.map.spawnableArea.size, stage.map.tileSize);

  drawRect(
    canvas._ctx,
    x - stage.map.tileSize[0] / 2,
    y - stage.map.tileSize[1] / 2,
    w,
    h,
    semiWhite
  );
}

function drawLaserTrails({ stage, canvas }: LoadedGameState) {
  const fadedRed = (alpha: number): ColorRGBA => [255, 0, 0, alpha];
  let laserTrailNode = stage.laserTrails;
  while (laserTrailNode !== null) {
    const laserTrail = laserTrailNode.value;
    const [x1, y1] = worldToCanvasTransform(
      stage.map.tileSize,
      laserTrail.sourceXY
    );
    const [x2, y2] = worldToCanvasTransform(
      stage.map.tileSize,
      laserTrail.targetXY
    );
    const alpha = laserTrail.lifetime / laserTrail.maxLifetime;

    drawLine(canvas._ctx, x1, y1, x2, y2, {
      color: fadedRed(alpha),
      lineWidth: 3,
    });

    laserTrailNode = laserTrailNode.next;
  }
}

function drawFlowField({ stage, canvas }: LoadedGameState) {
  const { map } = stage;
  const flowFieldList = Object.entries(map.flowField);

  const isLine = (val: Position[] | null): val is [Position, Position] => {
    return val !== null;
  };
  const flowFieldLines: [Position, Position][] = flowFieldList
    .map(([posStr, destination]) => {
      if (destination === null) return null;
      const pos = strToPos(posStr);

      const worldSrc = worldToCanvasTransform(stage.map.tileSize, pos);
      const worldDest = worldToCanvasTransform(stage.map.tileSize, destination);

      const flowLine = sdiv(sub(worldDest, worldSrc), 4);

      return [worldSrc, add(worldSrc, flowLine)];
    })
    .filter(isLine);

  drawLineGroup(canvas._ctx, flowFieldLines, { color: green });
}
