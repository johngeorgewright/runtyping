import { TestData } from '../../src/types'
import * as T from '../source/function'

export const A: TestData<T.A> = {
  success: [(_foo: string, _bar: number) => {}],
  failure: ['foo', null, { a: 1, b: 2 }],
}

export const B: TestData<T.B> = {
  success: [(_bar?: number) => {}],
  failure: ['foo', null, { a: 1, b: 2 }],
}

export const C: TestData<T.C> = {
  success: [
    ((_foo: string, bar?: number) =>
      bar === undefined ? (_x: number) => {} : undefined) as T.C,
  ],
  failure: ['foo', null, { a: 1, b: 2 }],
}

export const F: TestData<typeof T.F> = {
  success: [(foo: number) => foo.toString()],
  failure: ['foo', null, { a: 1, b: 2 }],
}

export const G: TestData<typeof T.G> = {
  success: [((foo: string | number) => foo) as typeof T.G],
  failure: ['foo', null, { a: 1, b: 2 }],
}
