import { Static, Record, String } from 'runtypes'

export const A = Record({ foo: String })

export type A = Static<typeof A>
