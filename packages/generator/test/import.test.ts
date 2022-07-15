import generateFixture from './generateFixture'

test('import', async () => {
  expect((await generateFixture('import.a', ['A'])).getText())
    .toMatchInlineSnapshot(`
    "import { Record, String, Static } from 'runtypes';

    export const A = Record({ foo: String, });

    export type A = Static<typeof A>;
    "
  `)
})
