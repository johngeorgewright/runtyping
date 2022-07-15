import { Project, QuoteKind } from 'ts-morph'
import generateFixture from './generateFixture'

test('function', async () => {
  expect(
    (
      await generateFixture('function', ['A', 'B', 'C', 'D', 'E', 'F'])
    ).getText()
  ).toMatchSnapshot()
})

test('function with non-strict nulls', async () => {
  expect(
    (
      await generateFixture('function', ['C'], {
        project: new Project({
          manipulationSettings: {
            quoteKind: QuoteKind.Single,
            usePrefixAndSuffixTextForRename: false,
            useTrailingCommas: true,
          },

          skipAddingFilesFromTsConfig: true,
        }),
      })
    ).getText()
  ).toMatchSnapshot()
})
