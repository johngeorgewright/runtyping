import { TypeOf, intersection, type, string } from 'io-ts'

export const A = type({ foo: string })

export type A = TypeOf<typeof A>

export const B = type({ bar: string })

export type B = TypeOf<typeof B>

export const C = intersection([A, B])

export type C = TypeOf<typeof C>
