import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function importTypeWriterTest(props: TypeWriterTestProps) {
  test('import', async () => {
    expect(
      (await generateFixture('import.a', ['A'], props)).getText()
    ).toMatchSnapshot()
  })
}
