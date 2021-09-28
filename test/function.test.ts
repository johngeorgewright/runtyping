import { Project, QuoteKind } from 'ts-morph'
import generateFixture from './generateFixture'

test('function', async () => {
  expect(
    (
      await generateFixture('function', ['A', 'B', 'C', 'D', 'E', 'F'])
    ).getText()
  ).toMatchInlineSnapshot(`
    "import { A as _A, B as _B, C as _C, D as _D, E as _E, F as _F } from './function';
    import { Contract, String, Number, Void, Undefined, Unknown, AsyncContract } from 'runtypes';

    export const A = Contract(String, Number, Void);

    export type A = _A;

    export const B = Contract(Number, Void);

    export type B = _B;

    export const C = Contract(String, Number.Or(Undefined), Unknown);

    export type C = _C;

    export const D = Contract(Number, String).enforce(_D);

    export type D = typeof D;

    export const E = AsyncContract(Number, String).enforce(_E);

    export type E = typeof E;

    export const F = Contract(Number, String);

    export type F = _F;
    "
  `)
})

test('function with non-strict nulls', async () => {
  expect(
    (
      await generateFixture(
        'function',
        ['C'],
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
    "import { C as _C } from './function';
    import { Contract, String, Number, Unknown } from 'runtypes';

    export const C = Contract(String, Number.optional(), Unknown);

    export type C = _C;
    "
  `)
})
