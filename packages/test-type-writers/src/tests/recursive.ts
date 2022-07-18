import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function recursiveTypeWriterTest(props: TypeWriterTestProps) {
  test('recursive', async () => {
    expect(
      (await generateFixture('recursive', ['A', 'B'], props)).getText()
    ).toMatchSnapshot()
  })
}
