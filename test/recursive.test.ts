import generateFixture from './generateFixture'

test('recursive', async () => {
  expect((await generateFixture('recursive', ['A', 'B'])).getText())
    .toMatchInlineSnapshot(`
    "import { A as _A, B as _B } from './recursive';
    import { Lazy, Runtype, Record, String, Static, Array } from 'runtypes';

    export const A = Lazy(() => Record({ recurse: String.Or(A), }));

    export type A = Static<typeof A>;

    export const B = Lazy(() => Record({ recurse: Array(B), }));

    export type B = Static<typeof B>;
    "
  `)
})
