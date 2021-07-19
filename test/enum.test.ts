import generateFixture from './generateFixture'

test('enum', async () => {
  expect((await generateFixture('enum', ['A', 'B'])).getText())
    .toMatchInlineSnapshot(`
    "import { Literal, Static } from 'runtypes';

    export const A = Literal(0).Or(Literal(1)).Or(Literal(2));

    export type A = Static<typeof A>;

    export const B = Literal(\\"a\\").Or(Literal(\\"b\\"));

    export type B = Static<typeof B>;
    "
  `)
})
