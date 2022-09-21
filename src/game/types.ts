export type MakeOptional<T, K extends keyof T> = Partial<T> & Pick<T, K>;

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

export enum MinionBehavior {
  Idle,
  Staging,
  Marching,
  Attacking,
}

export interface MinionStats {
  health: number;
  maxHealth: number;
  memoryUsage: number;
  movementSpeed: number;
  attackSpeed: number;
  attackDamage: number;
  attackRange: number;
  reload: number;
  dataGainedPerTileTravelled: number;
}

export interface Minion {
  id: string;
  xy: Position;
  stats: MinionStats;
  localStatMods: MinionStatModifiers;
  pathfinding: MinionPathfindingState;
  dataGain: ScalingValue;
  distanceTravelled: number;
  behavior: MinionBehavior;
  attackTargetId: string | null;
}

export enum TowerType {
  Goal = "goal",
  Basic = "basic",
}

export interface LaserTrail {
  sourceXY: Position;
  targetXY: Position;
  lifetime: number;
  maxLifetime: number;
}

export interface TowerStats {
  reload: number;
  health: number;
  maxHealth: number;
  range: number;
  reloadSpeed: number;
  attackDamage: number;
}

export interface Tower {
  id: string;
  xy: Position;
  type: TowerType;
  stats: TowerStats;
  localStatMods: TowerStatModifiers;
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
  id: string;
  tiles: Record<string, TileType>;
  mapSize: Dimension;
  tileSize: Dimension;
  goal: Position;
  goalDestroyed: boolean;
  flowField: Record<string, Vector | null>;
  distanceField: Record<string, number>;
  spawnableArea: Rect;
}

export interface Stage {
  map: GameMap;
  minions: ListNode<Minion> | null;
  towers: ListNode<Tower> | null;
  laserTrails: ListNode<LaserTrail> | null;
  startTime: Date;
  endTime: Date | null;
  advanceTimer: number;
}

export interface Canvas {
  _ctx: CanvasRenderingContext2D | null;
  size: Dimension;
}

export interface LoadedCanvas extends Canvas {
  _ctx: CanvasRenderingContext2D;
}

export interface ResourceState {
  currentMemory: number;
  maxMemory: number;
  currentData: number;
  maxData: number;
}

export interface PlayerStatModifiers {
  summonReload: ScalingValue;
  maxData: ScalingValue;
  maxMemory: ScalingValue;
}

export interface MinionStatModifiers {
  memoryUsage: ScalingValue;
  maxHealth: ScalingValue;
  movementSpeed: ScalingValue;
  attackSpeed: ScalingValue;
  attackDamage: ScalingValue;
  attackRange: ScalingValue;
  dataGainedPerTileTravelled: ScalingValue;
}

export interface TowerStatModifiers {
  maxHealth: ScalingValue;
  range: ScalingValue;
  reloadSpeed: ScalingValue;
  attackDamage: ScalingValue;
}

export interface GlobalStatModifiers {
  player: PlayerStatModifiers;
  minion: MinionStatModifiers;
  tower: TowerStatModifiers;
}

export enum Upgrades {
  MaxData = "maxData",
  MaxMemory = "maxMemory",
  MinionHealth = "minionHealth",
  MinionSpeed = "minionSpeed",
}

export interface Upgrade {
  nextCost: number;
  timesPurchased: number;
  nextCostCoefficient: number;
  nextMultiplier: number;
}

export interface UpgradeState {
  [Upgrades.MaxData]: Upgrade;
  [Upgrades.MaxMemory]: Upgrade;
  [Upgrades.MinionHealth]: Upgrade;
  [Upgrades.MinionSpeed]: Upgrade;
}

export interface PlayerStats {
  summonReload: number;
  summonReloadTime: number;
}

export interface PlayerState {
  stats: PlayerStats;
  resources: ResourceState;
  globalMods: GlobalStatModifiers;
  upgrades: UpgradeState;
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
  basePlayerMaxMemory: number;
  baseMinionMemoryUsage: number;
  baseMinionHealth: number;
  baseMinionMovementSpeed: number;
  baseMinionAttackSpeed: number;
  baseMinionAttackDamage: number;
  baseMinionAttackRange: number;
  baseTowerHealth: number;
  baseTowerRange: number;
  baseTowerAttackDamage: number;
  baseTowerReload: number;
  baseMinionDataGainedPerTileTravelled: number;

  baseMaxMemoryUpgradeCost: number;
  baseMaxMemoryUpgradeMultiplier: number;
  baseMaxMemoryUpgradeCostCoef: number;

  baseMaxDataUpgradeCost: number;
  baseMaxDataUpgradeMultiplier: number;
  baseMaxDataUpgradeCostCoef: number;

  baseMinionHealthUpgradeCost: number;
  baseMinionHealthUpgradeMultiplier: number;
  baseMinionHealthUpgradeCostCoef: number;

  baseMinionSpeedUpgradeCost: number;
  baseMinionSpeedUpgradeMultiplier: number;
  baseMinionSpeedUpgradeCostCoef: number;
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

export interface MouseState {
  xy: Position;
  left: boolean;
  right: boolean;
}

export interface InputState {
  mouse: MouseState;
}

export interface MapData {
  id: string;
  data: string;
}

export type UpdateDelegate = (
  game: LoadedGameState,
  delta: DOMHighResTimeStamp
) => void;
export type DrawDelegate = (game: LoadedGameState) => void;
