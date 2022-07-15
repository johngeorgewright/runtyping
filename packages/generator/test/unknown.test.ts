import generateFixture from './generateFixture'

test('unknown', async () => {
  expect((await generateFixture('unknown', ['A', 'B'])).getText())
    .toMatchInlineSnapshot(`
    "import { Unknown, Static } from 'runtypes';

    export const A = Unknown;

    export type A = Static<typeof A>;

    export const B = Unknown;

    export type B = Static<typeof B>;
    "
  `)
})
