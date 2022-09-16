import { ColorRGBA } from "./types";

let canvasContext: CanvasRenderingContext2D | null = null;

export function registerCanvasContext(ctx: CanvasRenderingContext2D | null) {
  canvasContext = ctx;
}

export function clearCanvas(color: ColorRGBA = [0, 0, 0, 1]) {
  if (!canvasContext) return;
  canvasContext.save();
  canvasContext.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3]}`;
  canvasContext.fillRect(
    0,
    0,
    canvasContext.canvas.width,
    canvasContext.canvas.height
  );
  canvasContext.restore();
}

export function drawRect(
  x: number,
  y: number,
  w: number,
  h: number,
  color: ColorRGBA
): void {
  if (!canvasContext) return;
  canvasContext.save();
  canvasContext.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3]}`;
  canvasContext.fillRect(x, y, w, h);
  canvasContext.restore();
}
