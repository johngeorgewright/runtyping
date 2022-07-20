import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function interfaceTypeWriterTest(props: TypeWriterTestProps) {
  test('interface', async () => {
    expect(
      (await generateFixture('interface', ['B', 'C'], props)).getText()
    ).toMatchSnapshot()
  })
}
