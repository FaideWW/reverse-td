export type ColorRGBA = [number, number, number, number];
export type Position = [number, number];
export type Dimension = [number, number];

export interface Minion {
  xy: Position;
  health: number;
  movementSpeed: number;
  attackSpeed: number;
}

enum TowerType {
  Basic = "basic",
}

export interface Tower {
  xy: Position;
  type: TowerType;
}

export interface Stage {
  tileSize: number;
  size: Dimension;
  minions: Minion[];
  towers: Tower[];
  goal: Position;
  timeElapsed: number;
}

export interface GameDelegate {
  update: UpdateDelegate;
  draw: DrawDelegate;
}

export interface GameState {
  currentStage: Stage;
  running: boolean;
  lastFrametime: number;
  delegate: GameDelegate;
}

export type UpdateDelegate = (stage: Stage, delta: DOMHighResTimeStamp) => void;
export type DrawDelegate = (stage: Stage) => void;
