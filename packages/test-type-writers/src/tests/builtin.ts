import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function builtInTypeWriterTest(props: TypeWriterTestProps) {
  test('builtin', async () => {
    expect(
      (await generateFixture('builtin', ['A'], props)).getText()
    ).toMatchSnapshot()
  })
}
