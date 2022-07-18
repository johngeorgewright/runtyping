import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function inheritanceTypeWriterTest(props: TypeWriterTestProps) {
  test('inheritance', async () => {
    expect(
      (await generateFixture('inheritance', ['C', 'D', 'E'], props)).getText()
    ).toMatchSnapshot()
  })
}
