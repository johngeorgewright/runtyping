import { TypeOf, union, literal, string } from 'io-ts'
import {
  A as _A,
  B as _B,
  C as _C,
  E as _E,
} from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/enum'

export const A = union([literal(_A.A1), literal(_A.B1), literal(_A.C1)])

export type A = TypeOf<typeof A>

export const B = union([literal(_B.A2), literal(_B.B2)])

export type B = TypeOf<typeof B>

export const C = union([literal(_C.A3), literal(_C.B3), literal(_C.C3)])

export type C = TypeOf<typeof C>

export const D = union([literal(_C.A3), literal(_C.B3)])

export type D = TypeOf<typeof D>

export const F = union([string, literal(_E.S)])

export type F = TypeOf<typeof F>

export const G = union([
  literal(_C.A3),
  literal(_C.B3),
  literal(_C.C3),
  literal(_E.S),
])

export type G = TypeOf<typeof G>
