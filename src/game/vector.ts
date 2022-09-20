import type { Position, Rect, Vector } from "./types";

export function add(v1: Vector, v2: Vector): Vector {
  return [v1[0] + v2[0], v1[1] + v2[1]];
}

export function sub(v1: Vector, v2: Vector): Vector {
  return [v1[0] - v2[0], v1[1] - v2[1]];
}

export function smul(v: Vector, s: number): Vector {
  return [v[0] * s, v[1] * s];
}

export function vmul(v1: Vector, v2: Vector): Vector {
  return [v1[0] * v2[0], v1[1] * v2[1]];
}

export function sdiv(v: Vector, s: number): Vector {
  return [v[0] / s, v[1] / s];
}

export function len(v: Vector): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

export function normalize(v: Vector): Vector {
  return sdiv(v, len(v));
}

export function lerp(v1: Vector, v2: Vector, t: number): Vector {
  return add(smul(v1, 1 - t), smul(v2, t));
}

export function dot(v1: Vector, v2: Vector): number {
  return v1[0] * v2[0] + v1[1] * v2[1];
}

export function distanceTo(p1: Position, p2: Position): number {
  return len(sub(p2, p1));
}

// Finds the distance from the given point to the closest point on the given
// rectangle
// See https://stackoverflow.com/a/18157551 for explanation
export function distanceToRect(p: Position, r: Rect): number {
  const rMaxX = r.xy[0] + r.size[0];
  const rMaxY = r.xy[1] + r.size[1];
  const rectX = Math.max(r.xy[0] - p[0], 0, p[0] - rMaxX);
  const rectY = Math.max(r.xy[1] - p[1], 0, p[1] - rMaxY);

  return len([rectX, rectY]);
}
