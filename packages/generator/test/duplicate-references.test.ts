import generateFixture from './generateFixture'

test('duplicate references', async () => {
  expect(
    (
      await generateFixture('duplicate-references', ['HorseType', 'FooType'])
    ).getText()
  ).toMatchInlineSnapshot(`
    "import { Record, Null, String, Static } from 'runtypes';

    export const FooType = Null.Or(String);

    export type FooType = Static<typeof FooType>;

    export const HorseType = Record({ a: FooType, b: FooType, });

    export type HorseType = Static<typeof HorseType>;
    "
  `)
})
