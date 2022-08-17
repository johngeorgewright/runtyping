import { TestData } from '../../src/types'
import * as T from '../source/unknown'

export const A: TestData<T.A> = {
  success: [undefined, 1, 'one', null, true, false, [], {}],
  failure: [],
}

export const B: TestData<T.B> = {
  success: [undefined, 1, 'one', null, true, false, [], {}],
  failure: [],
}
