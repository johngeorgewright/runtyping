import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function stringTypeWriterTest(props: TypeWriterTestProps) {
  test('strings', async () => {
    expect(
      (await generateFixture('string', ['A'], props)).getText()
    ).toMatchSnapshot()
  })
}
