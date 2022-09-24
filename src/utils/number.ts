export function formatNumber(num: number): string {
  return `${roundToNearest(num, 0.1)}`;
}

export function formatPercent(num: number): string {
  return `${roundToNearest((num - 1) * 100, 0.1)}%`;
}

export function roundToNearest(num: number, nearest: number): number {
  return Math.round(num / nearest) * nearest;
}
