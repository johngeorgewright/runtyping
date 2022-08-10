import { TestData } from '../../src/types'
import * as T from '../source/enum'

export const A: TestData<T.A> = {
  success: [T.A.A1, T.A.B1, T.A.C1],
  failure: ['foo', null, { a: 1, b: 2 }, T.B.A2],
}

export const B: TestData<T.B> = {
  success: [T.B.A2, T.B.B2],
  failure: ['foo', null, { a: 1, b: 2 }, T.A.A1],
}

export const C: TestData<T.C> = {
  success: [T.C.A3, T.C.B3, T.C.C3],
  failure: ['foo', null, { a: 1, b: 2 }, T.B.A2],
}

export const D: TestData<T.D> = {
  success: [T.C.A3, T.C.B3],
  failure: ['foo', null, { a: 1, b: 2 }, T.B.A2, T.C.C3],
}

export const F: TestData<T.F> = {
  success: ['foo', T.E.S],
  failure: [null, { a: 1, b: 2 }, T.A.B1],
}

export const G: TestData<T.G> = {
  success: [T.C.A3, T.C.B3, T.C.C3, T.E.S],
  failure: ['foo', null, { a: 1, b: 2 }, T.B.A2],
}
