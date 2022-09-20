import { GOAL_TOWER_ID, MAPDATA_CHARS_PER_TILE } from "./constants";
import {
  clearCanvas,
  drawCircle,
  drawLine,
  drawLineGroup,
  drawRect,
} from "./draw";
import { getNextMap } from "./maps";
import { createMinion, updateMinion } from "./minion";
import {
  computeFields,
  computeSpawnableArea,
  findNextWaypoint,
} from "./pathfinding";
import { updatePlayer } from "./player";
import { computeNextMinionMemoryRequired } from "./resources";
import { createTower, updateTower } from "./tower";
import type {
  ColorRGBA,
  Dimension,
  DrawDelegate,
  GameConfig,
  GameMap,
  GameState,
  LaserTrail,
  ListNode,
  LoadedGameState,
  MapData,
  Position,
  Stage,
  Tower,
  UpdateDelegate,
} from "./types";
import { TileType, TowerType } from "./types";
import {
  canvasToWorldTransform,
  llInsert,
  llRemove,
  pointInRect,
  posToStr,
  strToPos,
  worldToCanvasTransform,
} from "./util";
import { add, sdiv, smul, sub, vmul } from "./vector";

export function loadStage(
  game: GameState,
  now: Date,
  mapData: MapData
): [Stage, UpdateDelegate, DrawDelegate] {
  const stage = initStage(game, now, mapData);
  console.log(stage);

  return [stage, update, draw];
}

export function initStage(game: GameState, now: Date, mapData: MapData): Stage {
  const { canvas, config } = game;
  const [map, towers] = importMap(mapData, canvas.size, config);
  return {
    minions: null,
    towers,
    map,
    startTime: now,
    endTime: null,
    laserTrails: null,
    advanceTimer: 1,
  };
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

export function importMap(
  { data, id }: MapData,
  [canvasWidth, canvasHeight]: Dimension,
  config: GameConfig
): [GameMap, ListNode<Tower> | null] {
  const trimmedMap = data.trim().split("\n");
  const tileMap: Record<string, TileType> = {};
  const rows = trimmedMap.length;
  const cols = (trimmedMap[0]?.length || 0) / MAPDATA_CHARS_PER_TILE;

  let goalXY: Position | null = null;

  let towerListHead: ListNode<Tower> | null = null;

  for (let y = 0; y < trimmedMap.length; y += 1) {
    const row = trimmedMap[y] || [];
    for (let x = 0; x < row.length; x += MAPDATA_CHARS_PER_TILE) {
      // Each tile is encoded as 2 characters; the first is the tile type, the second is any tile metadata (eg. a wall might have a turret on it)
      const tileChar = row[x] || "0";
      const tileMetadata = row[x + 1] || "0";

      const tile = getTile(Number(tileChar));

      if (tile === TileType.WALL && Number(tileMetadata) === 1) {
        towerListHead = llInsert(
          towerListHead,
          createTower({ type: TowerType.Basic, xy: [x / 2, y] }, config)
        );
      } else if (tile === TileType.GOAL) {
        goalXY = [x / 2, y];
        towerListHead = llInsert(
          towerListHead,
          createTower(
            { id: GOAL_TOWER_ID, type: TowerType.Goal, xy: [x / 2, y] },
            config
          )
        );
      }

      tileMap[posToStr([x / 2, y])] = tile;
    }
  }

  if (!goalXY) throw new Error("No goal found on map");

  const [flowField, distanceField] = computeFields(tileMap, goalXY, [
    cols,
    rows,
  ]);
  const spawnableArea = computeSpawnableArea(tileMap, [cols, rows]);

  return [
    {
      id,
      tiles: tileMap,
      mapSize: [cols, rows],
      tileSize: [canvasWidth / cols, canvasHeight / rows],
      goal: goalXY,
      goalDestroyed: false,
      flowField,
      distanceField,
      spawnableArea,
    },
    towerListHead,
  ];
}

export function update(game: LoadedGameState, delta: DOMHighResTimeStamp) {
  handleInput(game);

  updatePlayer(game, delta);

  updateMinions(game, delta);
  updateLaserTrails(game, delta);

  if (game.stage.map.goalDestroyed) {
    if (game.stage.endTime === null) {
      game.stage.endTime = new Date();
    }

    game.stage.advanceTimer -= delta / 1000;
    if (game.stage.advanceTimer <= 0) {
      game.stage = initStage(game, new Date(), getNextMap(game.stage.map.id));
    }
  }

  updateTowers(game, delta);
}

export function handleInput(game: LoadedGameState) {
  const { stage, player, input, config } = game;
  if (input.mouse.left) {
    const nextMinionCost = computeNextMinionMemoryRequired(game);
    const playerMemoryFree =
      player.resources.maxMemory - player.resources.currentMemory;
    if (player.stats.summonReload <= 0 && nextMinionCost <= playerMemoryFree) {
      // Clearing the input inside the summon branch gives a minor gamefeel
      // improvement, allowing you to buffer a click slightly before the reload
      // timer expires and have the spawn trigger immediately.
      input.mouse.left = false;
      const worldMouse = canvasToWorldTransform(
        stage.map.tileSize,
        input.mouse.xy
      );
      if (!pointInRect(worldMouse, stage.map.spawnableArea)) return;

      const minion = createMinion({ xy: worldMouse }, config);
      minion.pathfinding.lastWaypoint = worldMouse;
      minion.pathfinding.nextWaypoint = findNextWaypoint(stage.map, minion.xy);
      stage.minions = llInsert(stage.minions, minion);

      player.stats.summonReload += player.stats.summonReloadTime;
    }
  }
}

export function updateMinions(
  game: LoadedGameState,
  delta: DOMHighResTimeStamp
) {
  const { stage } = game;
  let minionNode = stage.minions;
  while (minionNode !== null) {
    const minion = minionNode.value;

    const shouldDelete = updateMinion(minion, game, delta);

    if (shouldDelete) {
      stage.minions = llRemove(stage.minions, (m) => m.id === minion.id);
    }

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
  game: LoadedGameState,
  delta: DOMHighResTimeStamp
) {
  const { stage } = game;
  let towerNode = stage.towers;
  while (towerNode !== null) {
    const tower = towerNode.value;

    const shouldDelete = updateTower(tower, game, delta);

    if (shouldDelete) {
      stage.towers = llRemove(stage.towers, (t) => t.id === tower.id);
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

const red: ColorRGBA = [255, 0, 0, 1];
const green: ColorRGBA = [0, 255, 0, 1];
const blue: ColorRGBA = [0, 0, 255, 1];
const white: ColorRGBA = [255, 255, 255, 1];
const cyan: ColorRGBA = [0, 255, 255, 1];
const black: ColorRGBA = [0, 0, 0, 1];

function drawWalls({ stage, canvas }: LoadedGameState) {
  const { map } = stage;
  const [maxX, maxY] = map.mapSize;
  const [tileW, tileH] = map.tileSize;
  for (let y = 0; y < maxY; y += 1) {
    for (let x = 0; x < maxX; x += 1) {
      const tile = map.tiles[posToStr([x, y])];
      if (tile === TileType.WALL) {
        const [wx, wy] = worldToCanvasTransform(stage.map.tileSize, [x, y]);
        drawRect(canvas._ctx, wx - tileW / 2, wy - tileH / 2, tileW, tileH, {
          fill: blue,
        });
      }
    }
  }
}

function drawMinions(game: LoadedGameState) {
  const { stage, canvas } = game;
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
      { fill: white }
    );

    if (minion.stats.health < minion.stats.maxHealth) {
      drawHealthBarPx(
        game,
        add([x, y], [0, minionSize + 2]),
        [15, 5],
        minion.stats.health / minion.stats.maxHealth
      );
    }

    minionNode = minionNode.next;
  }
}

function drawHealthBarPx(
  { canvas }: LoadedGameState,
  [x, y]: Position,
  [w, h]: Dimension,
  hpRatio: number
) {
  // Draw background
  drawRect(canvas._ctx, x - w / 2, y - h / 2, w, h, {
    fill: red,
    stroke: white,
    lineWidth: 2,
  });
  const healthBarWidth = w * hpRatio;
  // Draw healthBar
  drawRect(canvas._ctx, x - w / 2, y - h / 2, healthBarWidth, h, {
    fill: green,
  });
}

function drawTowers(game: LoadedGameState) {
  const { stage, canvas } = game;
  let towerNode = stage.towers;
  while (towerNode !== null) {
    const tower = towerNode.value;
    switch (tower.type) {
      case TowerType.Basic:
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
        break;
      case TowerType.Goal:
        drawGoal(game, tower);
        break;
    }

    towerNode = towerNode.next;
  }
}

function drawGoal(game: LoadedGameState, goal: Tower) {
  const { stage, canvas } = game;
  const [x, y] = worldToCanvasTransform(stage.map.tileSize, stage.map.goal);
  const [tileW, tileH] = stage.map.tileSize;
  drawRect(canvas._ctx, x - tileW / 2, y - tileH / 2, tileW, tileH, {
    fill: green,
  });

  // Draw health bar
  const maxHealth = goal.stats.maxHealth;
  const healthRatio = goal.stats.health / maxHealth;
  if (healthRatio < 1) {
    drawHealthBarPx(game, [x, y], [15, 5], healthRatio);
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
    { fill: semiWhite }
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
