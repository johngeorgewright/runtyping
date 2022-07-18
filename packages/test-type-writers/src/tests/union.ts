import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function unionTypeWriterTest(props: TypeWriterTestProps) {
  test('union', async () => {
    expect(
      (await generateFixture('union', ['C'], props)).getText()
    ).toMatchSnapshot()
  })
}
