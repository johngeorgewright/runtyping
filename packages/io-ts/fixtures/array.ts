import { TypeOf, array, union, string, number, type } from 'io-ts'

export const A = type({ foo: string })

export type A = TypeOf<typeof A>

export const B = array(union([string, number, A]))

export type B = TypeOf<typeof B>
