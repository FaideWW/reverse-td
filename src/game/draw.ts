import { ColorRGBA, Position } from "./types";

export function colorToStr(color: ColorRGBA): string {
  return `rgba(${color[0]},${color[1]},${color[2]},${color[3]}`;
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  color: ColorRGBA = [0, 0, 0, 1]
) {
  if (!ctx) return;
  ctx.save();
  ctx.fillStyle = colorToStr(color);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

interface RectStyle {
  fill: ColorRGBA;
  stroke?: ColorRGBA;
  lineWidth?: number;
}
export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  { fill, stroke, lineWidth }: RectStyle
): void {
  if (!ctx) return;
  ctx.save();
  ctx.fillStyle = colorToStr(fill);
  if (stroke) {
    ctx.strokeStyle = colorToStr(stroke);
  }
  if (lineWidth) {
    ctx.lineWidth = lineWidth;
  }
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: ColorRGBA
): void {
  if (!ctx) return;
  ctx.save();
  ctx.fillStyle = colorToStr(color);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

export interface LineStyle {
  color: ColorRGBA;
  lineWidth?: number;
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: LineStyle
): void {
  if (!ctx) return;
  ctx.save();
  ctx.strokeStyle = colorToStr(style.color);
  ctx.lineWidth = style.lineWidth || 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function drawLineGroup(
  ctx: CanvasRenderingContext2D,
  lines: [Position, Position][],
  style: LineStyle
): void {
  if (!ctx) return;
  ctx.save();
  ctx.strokeStyle = colorToStr(style.color);
  ctx.lineWidth = style.lineWidth || 1;
  ctx.beginPath();
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const [[srcX, srcY], [destX, destY]] = line;
    ctx.moveTo(srcX, srcY);
    ctx.lineTo(destX, destY);
  }
  ctx.stroke();
  ctx.restore();
}
