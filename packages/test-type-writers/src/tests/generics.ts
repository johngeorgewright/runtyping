import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function genericsTypeWriterTest(props: TypeWriterTestProps) {
  test('generics', async () => {
    expect(
      (
        await generateFixture('generics', ['A', 'B', 'C', 'D', 'F'], props)
      ).getText()
    ).toMatchSnapshot()
  })
}
