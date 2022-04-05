import generateFixture from './generateFixture'

test('record', async () => {
  expect((await generateFixture('record', ['A'])).getText())
    .toMatchInlineSnapshot(`
    "import { Dictionary, String, Static } from 'runtypes';

    export const A = Dictionary(String, String);

    export type A = Static<typeof A>;
    "
  `)
})
