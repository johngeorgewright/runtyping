import { TestData } from '../../src/types'
import * as T from '../source/duplicate-references'

export const HorseType: TestData<T.HorseType> = {
  success: [
    { a: 'foo', b: 'bar' },
    { a: null, b: 'foo' },
    { a: 'foo', b: null },
  ],
  failure: ['foo', null, { c: 'bar' }, { a: 1, b: 2 }],
}
