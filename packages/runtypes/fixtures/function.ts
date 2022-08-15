import { Static, Function } from 'runtypes'

export const A = Function

export type A = Static<typeof A>
