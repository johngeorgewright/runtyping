import { Project, QuoteKind } from 'ts-morph'
import generateFixture from './generateFixture'

test('strict nulls', async () => {
  expect((await generateFixture('null', ['A', 'B', 'C'])).getText())
    .toMatchInlineSnapshot(`
    "import { Null, Static, String, Record, Undefined } from 'runtypes';

    export const A = Null;

    export type A = Static<typeof A>;

    export const B = Null.Or(String);

    export type B = Static<typeof B>;

    export const C = Record({ a: Null, b: Null.Or(String), c: Null.Or(String).Or(Undefined).optional(), });

    export type C = Static<typeof C>;
    "
  `)
})

test('non-strict nulls', async () => {
  expect(
    (
      await generateFixture(
        'null',
        ['A', 'B', 'C'],
        new Project({
          manipulationSettings: {
            quoteKind: QuoteKind.Single,
            usePrefixAndSuffixTextForRename: false,
            useTrailingCommas: true,
          },
          skipAddingFilesFromTsConfig: true,
        })
      )
    ).getText()
  ).toMatchInlineSnapshot(`
    "import { Null, Static, String, Record } from 'runtypes';

    export const A = Null;

    export type A = Static<typeof A>;

    export const B = String;

    export type B = Static<typeof B>;

    export const C = Record({ a: Null, b: String, c: String.optional(), });

    export type C = Static<typeof C>;
    "
  `)
})
