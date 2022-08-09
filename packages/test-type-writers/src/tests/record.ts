import generateFixture from '../fixture'
import { TypeWriterTestProps } from '../types'

export default function recordTypeWriterTest(props: TypeWriterTestProps) {
  test('record', async () => {
    expect(
      (await generateFixture('record', ['A'], props)).getText()
    ).toMatchSnapshot()
  })
}
