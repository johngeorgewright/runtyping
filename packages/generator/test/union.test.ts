import generateFixture from './generateFixture'

test('union', async () => {
  expect((await generateFixture('union', ['C'])).getText())
    .toMatchInlineSnapshot(`
    "import { String, Number, Static } from 'runtypes';

    export const C = String.Or(Number);

    export type C = Static<typeof C>;
    "
  `)
})
