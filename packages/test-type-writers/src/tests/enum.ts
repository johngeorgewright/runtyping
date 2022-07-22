import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function enumTest(props: TypeWriterTestProps) {
  test('enum', async () => {
    expect(
      (
        await generateFixture('enum', ['A', 'B', 'D', 'F', 'G'], props)
      ).getText()
    ).toMatchSnapshot()
  })
}
