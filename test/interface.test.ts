import generateFixture from './generateFixture'

test('interface', async () => {
  expect((await generateFixture('interface', ['B', 'C'])).getText())
    .toMatchInlineSnapshot(`
    "import { Record, String, Number, Static, Literal, Contract, Void } from 'runtypes';

    export const A = Record({ foo: String, bar: Number, });

    export type A = Static<typeof A>;

    export const B = Record({ a: A, b: Literal(\\"B\\"), });

    export type B = Static<typeof B>;

    export const C = Record({ foo: Contract(String), bar: Number, boo: Contract(String, Void), });

    export type C = Static<typeof C>;
    "
  `)
})
