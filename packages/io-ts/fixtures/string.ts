import { TypeOf, string } from 'io-ts'

export const A = string

export type A = TypeOf<typeof A>
