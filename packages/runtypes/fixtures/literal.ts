import { Static, Literal } from 'runtypes'

export const A = Literal('foo')

export type A = Static<typeof A>

export const B = Literal(2)

export type B = Static<typeof B>

export const C = Literal(true)

export type C = Static<typeof C>
