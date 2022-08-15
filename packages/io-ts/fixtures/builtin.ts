import { TypeOf, type, Type, failure, success } from 'io-ts'

export const A = type({
  a: new Type<Uint8Array>(
    'Uint8Array',
    (u): u is Uint8Array => u instanceof Uint8Array,
    (i, c) =>
      i instanceof Uint8Array ? success(i) : failure(i, c, 'not a Uint8Array'),
    (a) => a
  ),
})

export type A = TypeOf<typeof A>
