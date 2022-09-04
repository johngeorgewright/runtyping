import { failure, success, Type } from 'io-ts'

export const emptyTuple = new Type<never[]>(
  'never[]',
  (u): u is never[] => Array.isArray(u) && u.length === 0,
  (i, c) =>
    Array.isArray(i) && i.length === 0
      ? success(i as never[])
      : failure(i, c, 'not an empty array'),
  (a) => a
)

export function arrayOfLength<T extends unknown[]>(length: number) {
  return new Type<T>(
    `array of length ${length}`,
    (u): u is T => Array.isArray(u) && u.length === length,
    (i, c) =>
      Array.isArray(i) && i.length === length
        ? success(i as T)
        : failure(i, c, `not an array of length ${length}`),
    (a) => a
  )
}

export const never = new Type<any>(
  'never',
  (_): _ is never => false,
  (u, c) => failure(u, c),
  () => {
    throw new Error('cannot encode never')
  }
)
