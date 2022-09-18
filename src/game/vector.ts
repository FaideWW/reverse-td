import { Vector } from "./types";

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
