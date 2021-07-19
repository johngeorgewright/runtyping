import generateFixture from './generateFixture'

test('interface', () => {
  expect(generateFixture('interface', ['B']).getText()).toMatchInlineSnapshot(`
"import { Record, String, Number, Static, Literal } from 'runtypes';

export const A = Record({ foo: String, bar: Number, });

export type A = Static<typeof A>;

export const B = Record({ a: A, b: Literal(\\"B\\"), });

export type B = Static<typeof B>;
"
`)
})
