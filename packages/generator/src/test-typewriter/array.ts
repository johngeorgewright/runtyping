import generateFixture from './generateFixture'
import { TypeWriterTestProps } from './types'

export default function arrayTypeWriterTest(props: TypeWriterTestProps) {
  test('array', async () => {
    expect(
      (await generateFixture('array', ['B'], props)).getText()
    ).toMatchSnapshot()
  })
}
