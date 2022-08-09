import generateFixture from '../fixture'
import { TypeWriterTestProps } from '../types'

export default function unknownTypeWriterTest(props: TypeWriterTestProps) {
  test('unknown', async () => {
    expect((await generateFixture('unknown', ['A', 'B'], props)).getText())
  })
}
