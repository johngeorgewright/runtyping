export function mapValues<T extends Record<string, unknown>, R>(
  obj: T,
  map: <K extends keyof T>(value: T[K], key: K) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>
  for (const key in obj) result[key] = map(obj[key], key)
  return result
}
