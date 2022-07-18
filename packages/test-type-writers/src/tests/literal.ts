import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function literalTypeWriterTest(props: TypeWriterTestProps) {
  test('literal', async () => {
    expect(
      (await generateFixture('literal', ['A', 'B', 'C'], props)).getText()
    ).toMatchSnapshot()
  })
}
