import { Project, QuoteKind } from 'ts-morph'
import generateFixture from './generateFixture'
import { TypeWriterTestProps } from './types'

export default function nullTypeWriterTest(props: TypeWriterTestProps) {
  test('strict nulls', async () => {
    expect(
      (await generateFixture('null', ['A', 'B', 'C'], props)).getText()
    ).toMatchSnapshot()
  })

  test('non-strict nulls', async () => {
    expect(
      (
        await generateFixture('null', ['A', 'B', 'C'], {
          ...props,
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
}
