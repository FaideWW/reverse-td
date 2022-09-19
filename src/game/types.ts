export type ColorRGBA = [number, number, number, number];

export type Vector = [number, number];
export type Position = Vector;
export type Dimension = Vector;

export interface ScalingValue {
  base: number;
  multiplier: number;
}

export interface ListNode<T> {
  value: T;
  next: ListNode<T> | null;
}

export interface MinionPathfindingState {
  tileOffset: Position;
  lastWaypoint: Position | null;
  nextWaypoint: Position | null;
}

export interface Minion {
  id: string;
  xy: Position;
  health: number;
  maxHealth: ScalingValue;
  movementSpeed: ScalingValue;
  attackSpeed: ScalingValue;
  pathfinding: MinionPathfindingState;
  dataGain: ScalingValue;
  distanceTravelled: number;
}

export enum TowerType {
  Basic = "basic",
}

export interface LaserTrail {
  sourceXY: Position;
  targetXY: Position;
  lifetime: number;
  maxLifetime: number;
}

export interface Tower {
  id: string;
  xy: Position;
  type: TowerType;
  range: ScalingValue;
  reload: number;
  reloadSpeed: ScalingValue;
  attackDamage: ScalingValue;
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
  minions: ListNode<Minion> | null;
  towers: ListNode<Tower> | null;
  laserTrails: ListNode<LaserTrail> | null;
  timeElapsed: number;
}

export interface Canvas {
  _ctx: CanvasRenderingContext2D | null;
  size: Dimension;
}

export interface LoadedCanvas extends Canvas {
  _ctx: CanvasRenderingContext2D;
}

export interface ResourceState {
  currentData: number;
  maxData: ScalingValue;
}

export interface GameState {
  stage: Stage | null;
  player: PlayerState;
  running: boolean;
  input: InputState;
  update: UpdateDelegate;
  draw: DrawDelegate;
  canvas: Canvas;
  settings: GameSettings;
  config: GameConfig;
}

export interface GameSettings {
  showFlowField: boolean;
}

export interface GameConfig {
  basePlayerSummonReload: number;
  basePlayerMaxData: number;
  baseMinionHealth: number;
  baseMinionMovementSpeed: number;
  baseMinionAttackSpeed: number;
  baseTowerRange: number;
  baseTowerShotDamage: number;
  baseTowerReload: number;
  baseDataGainedPerTileTravelled: number;
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
  updateConfig: (newConfig: Partial<GameConfig>) => void;
}

export interface PlayerState {
  summonReloadRemaining: number;
  summonReloadTime: ScalingValue;
  resources: ResourceState;
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
