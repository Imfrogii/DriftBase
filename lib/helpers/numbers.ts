export function roundCount(value: number): number {
  if (value < 10) return value;
  return Math.floor(value / 10) * 10;
}
