import { TypeOf, string, record } from 'io-ts'

export const A = record(string, string)

export type A = TypeOf<typeof A>
