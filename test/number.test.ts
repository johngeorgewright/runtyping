import generateFixture from './generateFixture'

test('numbers', async () => {
  expect((await generateFixture('number', ['A'])).getText())
    .toMatchInlineSnapshot(`
    "import { Number, Static } from 'runtypes';

    export const A = Number;

    export type A = Static<typeof A>;
    "
  `)
})
