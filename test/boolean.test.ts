import generateFixture from './generateFixture'

test('boolean', async () => {
  expect((await generateFixture('boolean', ['A'])).getText())
    .toMatchInlineSnapshot(`
    "import { Boolean, Static } from 'runtypes';

    export const A = Boolean;

    export type A = Static<typeof A>;
    "
  `)
})
