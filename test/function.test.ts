import generateFixture from './generateFixture'

test('function', async () => {
  expect((await generateFixture('function', ['A', 'B', 'C'])).getText())
    .toMatchInlineSnapshot(`
    "import { A as _A, B as _B, C as _C } from './function';
    import { Contract, String, Number, Void, Static, Unknown } from 'runtypes';

    export const A = Contract(String, Number, Void).enforce(_A);

    export type A = Static<typeof A>;

    export const B = Contract(Number, Void).enforce(_B);

    export type B = Static<typeof B>;

    export const C = Contract(String, Number, Unknown).enforce(_C);

    export type C = Static<typeof C>;
    "
  `)
})
