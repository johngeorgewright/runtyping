import fixture from '../fixture'
import { TypeWriterTestProps } from '../types'

export default function arrayTypeWriterTest(props: TypeWriterTestProps) {
  test('array', () => fixture('array', ['B'], props))
}
