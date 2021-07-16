import generateFixture from './generateFixture'

test('recursive', () => {
  expect(generateFixture('recursive', ['A']).getText()).toMatchInlineSnapshot(`
"import { Lazy, Record, String, Static } from \\"runtypes\\";

export const A = Lazy(() => Record({ recurse: String.Or(A), }));

export type A = Static<typeof A>;
"
`)
})
