import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function numberTypeWriterTest(props: TypeWriterTestProps) {
  test('numbers', async () => {
    expect(
      (await generateFixture('number', ['A'], props)).getText()
    ).toMatchSnapshot()
  })
}
