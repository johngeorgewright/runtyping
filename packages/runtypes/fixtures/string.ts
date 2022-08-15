import { Static, String } from 'runtypes'

export const A = String

export type A = Static<typeof A>
