import generateFixture from './generateFixture'

test('inheritance', async () => {
  expect((await generateFixture('inheritance', ['C', 'D'])).getText())
    .toMatchInlineSnapshot(`
    "import { Record, String, Static, Number } from 'runtypes';

    export const B = Record({ foo: String, });

    export type B = Static<typeof B>;

    export const C = B.And(Record({ bar: String, foo: String, }));

    export type C = Static<typeof C>;

    export const E = Record({ foo: Number, bar: Number, car: String, });

    export type E = Static<typeof E>;

    export const D = E.And(Record({ bar: Number, moo: String, foo: Number, car: String, }));

    export type D = Static<typeof D>;
    "
  `)
})
