import generateFixture from '../fixture'
import { TypeWriterTestProps } from '../types'

export default function booleanTypeWriterTest(props: TypeWriterTestProps) {
  test('boolean', async () => generateFixture('boolean', ['A'], props))
}
