export type ColorRGBA = [number, number, number, number];

export type Vector = [number, number];
export type Position = Vector;
export type Dimension = Vector;

export interface MinionPathfindingState {
  tileOffset: Position;
  lastWaypoint: Position | null;
  nextWaypoint: Position | null;
}

export interface Minion {
  id: string;
  xy: Position;
  health: number;
  movementSpeed: number;
  attackSpeed: number;
  pathfinding: MinionPathfindingState;
}

export enum TowerType {
  Basic = "basic",
}

export interface Tower {
  id: string;
  xy: Position;
  type: TowerType;
  range: number;
  trackingMinionId: string | null;
  facingAngle: number;
}

export enum TileType {
  OPEN = 0,
  GOAL = 1,
  WALL = 2,
  SPAWNABLE = 3,
}

export interface Rect {
  xy: Position;
  size: Dimension;
}

export interface GameMap {
  tiles: Record<string, TileType>;
  mapSize: Dimension;
  tileSize: Dimension;
  goal: Position;
  flowField: Record<string, Vector | null>;
  distanceField: Record<string, number>;
  spawnableArea: Rect;
}

export interface Stage {
  map: GameMap;
  minions: string[];
  minionMap: Record<string, Minion>;
  towers: string[];
  towerMap: Record<string, Tower>;
  timeElapsed: number;
  player: PlayerState;
}

export interface Canvas {
  _ctx: CanvasRenderingContext2D | null;
  size: Dimension;
}

export interface LoadedCanvas extends Canvas {
  _ctx: CanvasRenderingContext2D;
}

export interface GameState {
  stage: Stage | null;
  running: boolean;
  input: InputState;
  update: UpdateDelegate;
  draw: DrawDelegate;
  canvas: Canvas;
  settings: GameSettings;
}

export interface GameSettings {
  showFlowField: boolean;
}

export interface LoadedGameState extends GameState {
  stage: Stage;
  canvas: LoadedCanvas;
}

export interface GameActions {
  registerCanvas: (
    ctx: CanvasRenderingContext2D | null,
    width: number,
    height: number
  ) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
}

export interface PlayerState {
  summonReloadRemaining: number;
  summonReloadTime: number;
}

export interface MouseState {
  xy: Position;
  left: boolean;
  right: boolean;
}

export interface InputState {
  mouse: MouseState;
}

export type UpdateDelegate = (
  game: LoadedGameState,
  delta: DOMHighResTimeStamp
) => void;
export type DrawDelegate = (game: LoadedGameState) => void;
