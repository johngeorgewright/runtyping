import generateFixture from './generateFixture'

test('optional property', async () => {
  expect((await generateFixture('optional', ['A'])).getText())
    .toMatchInlineSnapshot(`
    "import { Record, String, Undefined, Static } from 'runtypes';

    export const A = Record({ foo: String.Or(Undefined).optional(), });

    export type A = Static<typeof A>;
    "
  `)
})
