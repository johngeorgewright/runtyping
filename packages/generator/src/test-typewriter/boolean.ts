import generateFixture from './generateFixture'
import { TypeWriterTestProps } from './types'

export default function booleanTypeWriterTest(props: TypeWriterTestProps) {
  test('boolean', async () => {
    expect(
      (await generateFixture('boolean', ['A'], props)).getText()
    ).toMatchSnapshot()
  })
}
