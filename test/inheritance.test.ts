import generateFixture from './generateFixture'

test('inheritance', async () => {
  expect((await generateFixture('inheritance', ['C', 'D', 'E'])).getText())
    .toMatchInlineSnapshot(`
    "import { Record, String, Static, Literal, Number } from 'runtypes';

    export const B = Record({ foo: String, });

    export type B = Static<typeof B>;

    export const C = B.And(Record({ bar: String, foo: String, }));

    export type C = Static<typeof C>;

    export const F = Record({ imported: Literal(true), });

    export type F = Static<typeof F>;

    export const D = F.And(Record({ bar: Number, moo: String, foo: Number, car: String, }));

    export type D = Static<typeof D>;

    export const E = F.And(Record({ imported: Literal(true), }));

    export type E = Static<typeof E>;
    "
  `)
})
