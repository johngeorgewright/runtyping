import generateFixture from './generateFixture'

test('function', async () => {
  expect((await generateFixture('function', ['A', 'B', 'C'])).getText())
    .toMatchInlineSnapshot(`
    "import { Contract, String, Number, Void, Static, Unknown } from 'runtypes';

    export const A = Contract(String, Number, Void);

    export type A = Static<typeof A>;

    export const B = Contract(Number, Void);

    export type B = Static<typeof B>;

    export const C = Contract(String, Number, Unknown);

    export type C = Static<typeof C>;
    "
  `)
})
