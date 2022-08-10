import { TestData } from '../../src/types'
import * as T from '../source/recursive'

export const A: TestData<T.A> = {
  success: [{ recurse: 'foo' }, { recurse: { recurse: 'foo' } }],
  failure: [{ recurse: 1 }, { recurse: null }],
}

export const B: TestData<T.B> = {
  success: [{ recurse: [{ recurse: [] }] }],
  failure: [{ recurse: [{ recurse: 1 }] }],
}
