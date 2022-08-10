import { TestData } from '../../src/types'
import * as T from '../source/interface'

export const A: TestData<T.A> = {
  success: [
    {
      foo: 'string',
      bar: 1,
      'has spaces': true,
      '+1': true,
      '-1': true,
      __underscores__: true,
      $dollar: true,
      '${escaped template vars}': true,
    },
  ],
  failure: ['string', 1, true, null, undefined, [], {}],
}

export const B: TestData<T.B> = {
  success: [
    {
      a: {
        foo: 'string',
        bar: 1,
        'has spaces': true,
        '+1': true,
        '-1': true,
        __underscores__: true,
        $dollar: true,
        '${escaped template vars}': true,
      },
      b: 'B',
    },
  ],
  failure: [
    {
      a: {
        foo: 'string',
        bar: 1,
        'has spaces': true,
        '+1': true,
        '-1': true,
        __underscores__: true,
        $dollar: true,
      },
      b: 'C',
    },
  ],
}

export const C: TestData<T.C> = {
  success: [{ foo: () => 'foo', bar: 1, boo: (_x: string) => {} }],
  failure: ['foo', 1, true, null, undefined, [], {}],
}
