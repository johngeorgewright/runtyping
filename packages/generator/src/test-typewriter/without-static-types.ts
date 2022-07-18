import generateFixture from './generateFixture'
import { TypeWriterTestProps } from './types'

export default function withoutStaticTypeWriterTest(
  props: TypeWriterTestProps
) {
  test('dont generate static types', async () => {
    expect(
      (
        await generateFixture('without-static-types', ['Three'], {
          ...props,
          exportStaticType: false,
        })
      ).getText()
    ).toMatchSnapshot()
  })
}
