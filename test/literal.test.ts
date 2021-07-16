import generateFixture from './generateFixture'

test('literal', () => {
  expect(generateFixture('literal', ['A', 'B', 'C']).getText())
    .toMatchInlineSnapshot(`
    "import { Literal, Static } from \\"runtypes\\";

    export const A = Literal(\\"foo\\");

    export type A = Static<typeof A>;

    export const B = Literal(2);

    export type B = Static<typeof B>;

    export const C = Literal(true);

    export type C = Static<typeof C>;
    "
  `)
})
