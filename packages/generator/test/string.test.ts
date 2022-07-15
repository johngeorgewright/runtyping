import generateFixture from './generateFixture'

test('strings', async () => {
  expect((await generateFixture('string', ['A'])).getText())
    .toMatchInlineSnapshot(`
    "import { String, Static } from 'runtypes';

    export const A = String;

    export type A = Static<typeof A>;
    "
  `)
})
