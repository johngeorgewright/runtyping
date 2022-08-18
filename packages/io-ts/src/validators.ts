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
