import { Project, QuoteKind } from 'ts-morph'
import generateFixture from './generateFixture'

test('strict nulls', async () => {
  expect(
    (await generateFixture('null', ['A', 'B', 'C'])).getText()
  ).toMatchSnapshot()
})

test('non-strict nulls', async () => {
  expect(
    (
      await generateFixture('null', ['A', 'B', 'C'], {
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
