import { clearCanvas, drawRect } from "./draw";
import { ColorRGBA, DrawDelegate, Stage, UpdateDelegate } from "./types";

export function initStage(): [Stage, UpdateDelegate, DrawDelegate] {
  const stage: Stage = {
    tileSize: 20,
    minions: [],
    towers: [],
    size: [11, 20],
    goal: [5, 0],
    timeElapsed: 0,
  };

  return [stage, update, draw];
}

export function update(/* stage: Stage */) {
  return;
}

export function draw(stage: Stage) {
  clearCanvas();

  drawGoal(stage);
}

const green: ColorRGBA = [0, 255, 0, 1];

function drawGoal(stage: Stage) {
  const [gx, gy] = stage.goal;
  drawRect(
    gx * stage.tileSize,
    gy * stage.tileSize,
    stage.tileSize,
    stage.tileSize,
    green
  );
}
