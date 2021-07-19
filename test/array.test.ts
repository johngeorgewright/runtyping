import generateFixture from './generateFixture'

test('array', async () => {
  expect((await generateFixture('array', ['B'])).getText())
    .toMatchInlineSnapshot(`
"import { Array, String, Number, Record, Static } from 'runtypes';

export const A = Record({ foo: String, });

export type A = Static<typeof A>;

export const B = Array(String.Or(Number).Or(A));

export type B = Static<typeof B>;
"
`)
})
