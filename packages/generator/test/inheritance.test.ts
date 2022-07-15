import generateFixture from './generateFixture'

test('inheritance', async () => {
  expect((await generateFixture('inheritance', ['C', 'D', 'E'])).getText())
    .toMatchInlineSnapshot(`
    "import { Record, String, Static, Number, Literal } from 'runtypes';

    export const C = Record({ bar: String, foo: String, });

    export type C = Static<typeof C>;

    export const D = Record({ bar: Number, moo: String, foo: Number, car: String, });

    export type D = Static<typeof D>;

    export const E = Record({ imported: Literal(true), });

    export type E = Static<typeof E>;
    "
  `)
})
