import { TypeOf, unknown as Unknown } from 'io-ts'

export const A = Unknown

export type A = TypeOf<typeof A>

export const B = Unknown

export type B = TypeOf<typeof B>
