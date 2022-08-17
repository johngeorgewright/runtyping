import { TestData } from '../../src/types'
import * as T from '../source/intersection'

export const C: TestData<T.C> = {
  success: [{ foo: 'mung', bar: 'face' }],
  failure: [{ foo: 'bar' }, { bar: 'foo' }],
}
