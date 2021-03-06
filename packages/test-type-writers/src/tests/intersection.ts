import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function intersectionTypeWriterTest(props: TypeWriterTestProps) {
  test('intersection', async () => {
    expect(
      (await generateFixture('intersection', ['C'], props)).getText()
    ).toMatchSnapshot()
  })
}
