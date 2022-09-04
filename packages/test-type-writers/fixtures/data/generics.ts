import {
  TestData,
  TestDataArgNumber,
  TestDataArgString,
  TestDataCall,
} from '../../src/types'
import * as T from '../source/generics'

export const A: TestData<T.A<any>> = {
  success: [
    { [TestDataCall]: [TestDataArgString], data: { type: 'foo' } },
    { [TestDataCall]: [TestDataArgNumber], data: { type: 1 } },
  ],
  failure: [
    'foo',
    null,
    { type: 1 },
    { type: null },
    { [TestDataCall]: [TestDataArgString], data: { type: 1 } },
    { [TestDataCall]: [TestDataArgNumber], data: { type: 'one' } },
  ],
}

export const B: TestData<T.B<string>> = {
  success: [{ [TestDataCall]: [TestDataArgString], data: { type: 'foo' } }],
  failure: [
    'foo',
    null,
    { type: 1 },
    { type: null },
    { [TestDataCall]: [TestDataArgString], data: { type: 1 } },
  ],
}

export const C: TestData<T.C<any>> = {
  success: [
    { [TestDataCall]: [TestDataArgString], data: 'foo' },
    { [TestDataCall]: [TestDataArgNumber], data: 1 },
  ],
  failure: [
    'foo',
    null,
    { type: 1 },
    { type: null },
    { [TestDataCall]: [TestDataArgString], data: true },
    { [TestDataCall]: [TestDataArgNumber], data: true },
  ],
}

export const D: TestData<T.D<number>> = {
  success: [{ [TestDataCall]: [TestDataArgNumber], data: { type: 1 } }],
  failure: [
    'foo',
    null,
    { type: 1 },
    { type: null },
    { [TestDataCall]: [TestDataArgNumber], data: { type: 'one' } },
  ],
}

export const F: TestData<T.F<T.E>> = {
  success: [
    {
      [TestDataCall]: [{ foo: TestDataArgString }],
      data: { type: { foo: 'bar' } },
    },
  ],
  failure: [
    {
      [TestDataCall]: [{ foo: TestDataArgString }],
      data: { type: { foo: 1 } },
    },
  ],
}

export const G: TestData<T.G> = {
  success: [
    {
      abc: { type: { data: 'foo' } },
    },
  ],
  failure: [
    {
      abc: { data: 'foo' },
    },
  ],
}

export const Foo: TestData<T.Foo> = {
  success: [{ abc: { data: 'foo', count: 1 } }],
  failure: [{ abc: 'foo' }],
}
