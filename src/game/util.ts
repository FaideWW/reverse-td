import {
  Dimension,
  ListNode,
  Position,
  Rect,
  ScalingValue,
  TileType,
} from "./types";
import { add } from "./vector";

export function canvasToWorldTransform(
  [tw, th]: Dimension,
  [cx, cy]: Position
): Position {
  return [cx / tw - 0.5, cy / th - 0.5];
}

export function worldToCanvasTransform(
  [tw, th]: Dimension,
  [wx, wy]: Position
): Position {
  return [wx * tw + tw / 2, wy * th + th / 2];
}

export function posToStr([x, y]: Position): string {
  return `${x}-${y}`;
}

export function strToPos(str: string): Position {
  const [x, y] = str.split("-");
  return [Number(x), Number(y)];
}

// Searches for a tile of type `type` and returns the first tile found (or null
// if no tiles were found).
// The search is not guaranteed to be ordered or stable, this will simply
// return a tile from the map that matches the given type.
export function findTile(
  tileMap: Record<string, TileType>,
  type: TileType
): Position | null {
  const tiles = Object.entries(tileMap);
  for (let i = 0; i < tiles.length; i += 1) {
    const entry = tiles[i];
    if (!entry) continue;
    const [tileCoord, tile] = entry;
    const [x, y] = strToPos(tileCoord);
    if (tile === type) return [x, y];
  }

  return null;
}

export function pointInRect(point: Position, rect: Rect): boolean {
  const [rectMinX, rectMinY] = rect.xy;
  const [rectMaxX, rectMaxY] = add(rect.xy, rect.size);

  return (
    point[0] >= rectMinX &&
    point[0] <= rectMaxX &&
    point[1] >= rectMinY &&
    point[1] <= rectMaxY
  );
}

export function llFind<T>(
  head: ListNode<T> | null,
  predicate: (val: T) => boolean
): T | null {
  if (head === null) return null;
  let node: ListNode<T> | null = head;
  while (node !== null) {
    if (predicate(node.value)) {
      return node.value;
    }

    node = node.next;
  }

  return null;
}

// Insert an element at the head of the list (unsorted)
export function llInsert<T>(head: ListNode<T> | null, value: T): ListNode<T> {
  return {
    value,
    next: head,
  };
}

export function llRemove<T>(
  head: ListNode<T> | null,
  predicate: (val: T) => boolean
): ListNode<T> | null {
  let last = null;
  let node: ListNode<T> | null = head;
  while (node !== null) {
    if (predicate(node.value)) {
      if (last === null) {
        // If last is null we're at the head of the list, so simply return head.next as the new head
        return node.next;
      }

      // Otherwise, link up last with node.next
      last.next = node.next;
      return head;
    }

    last = node;
    node = node.next;
  }

  return head;
}

export function llEach<T>(
  head: ListNode<T> | null,
  operator: (val: T) => void
): void {
  if (head === null) return;
  let node: ListNode<T> | null = head;
  while (node !== null) {
    operator(node.value);
    node = node.next;
  }
}

export function resolve(value: ScalingValue): number {
  return value.base * value.multiplier;
}

export function makeScalingValue(base: number, multiplier = 1): ScalingValue {
  return { base, multiplier };
}
