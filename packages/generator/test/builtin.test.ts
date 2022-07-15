import generateFixture from './generateFixture'

test('builtin', async () => {
  expect((await generateFixture('builtin', ['A'])).getText())
    .toMatchInlineSnapshot(`
    "import { Record, InstanceOf, Static } from 'runtypes';

    export const A = Record({ a: InstanceOf(Uint8Array), });

    export type A = Static<typeof A>;
    "
  `)
})
