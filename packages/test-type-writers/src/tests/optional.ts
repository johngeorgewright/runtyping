import generateFixture from '../fixture'
import { TypeWriterTestProps } from '../types'

export default function optionalTypeWriterTest(props: TypeWriterTestProps) {
  test('optional property', async () => {
    expect(
      (await generateFixture('optional', ['A'], props)).getText()
    ).toMatchSnapshot()
  })
}
