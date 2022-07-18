import generateFixture from './generateFixture'
import { TypeWriterTestProps } from './types'

export default function namespaceTypeWriterTest(props: TypeWriterTestProps) {
  test('namespace', async () => {
    expect(
      (
        await generateFixture(
          'namespace',
          ['A.B', 'B.C.D', 'A.C', 'A.D'],
          props
        )
      ).getText()
    ).toMatchSnapshot()
  })
}
