import { TestData } from '../../src/types.js'
import * as T from '../source/intersection.js'

export const C: TestData<T.C> = {
  success: [{ foo: 'mung', bar: 'face' }],
  failure: [{ foo: 'bar' }, { bar: 'foo' }],
}
