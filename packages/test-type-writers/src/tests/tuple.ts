import generateFixture from '../fixture'
import { TypeWriterTestProps } from '../types'

export default function tupleTypeWriterTest(props: TypeWriterTestProps) {
  test('tuple', async () => {
    expect(
      (await generateFixture('tuple', ['A', 'B'], props)).getText()
    ).toMatchSnapshot()
  })
}
