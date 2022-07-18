import { Project, QuoteKind } from 'ts-morph'
import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function functionTypeWriterTest(props: TypeWriterTestProps) {
  test('function', async () => {
    expect(
      (
        await generateFixture('function', ['A', 'B', 'C', 'D', 'E', 'F'], props)
      ).getText()
    ).toMatchSnapshot()
  })

  test('function with non-strict nulls', async () => {
    expect(
      (
        await generateFixture('function', ['C'], {
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
