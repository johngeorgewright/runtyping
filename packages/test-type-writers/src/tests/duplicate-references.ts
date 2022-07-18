import generateFixture from '../generateFixture'
import { TypeWriterTestProps } from '../types'

export default function duplicateReferencesTest(props: TypeWriterTestProps) {
  test('duplicate references', async () => {
    expect(
      (
        await generateFixture(
          'duplicate-references',
          ['HorseType', 'FooType'],
          props
        )
      ).getText()
    ).toMatchSnapshot()
  })
}
