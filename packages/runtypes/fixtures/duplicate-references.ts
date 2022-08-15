import { Static, Record, Null, String } from 'runtypes'

export const FooType = Null.Or(String)

export type FooType = Static<typeof FooType>

export const HorseType = Record({ a: FooType, b: FooType })

export type HorseType = Static<typeof HorseType>
