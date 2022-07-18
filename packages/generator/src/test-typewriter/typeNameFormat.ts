import generateFixture from './generateFixture'
import { TypeWriterTestProps } from './types'

export default function typeNameFormateTypeWriterTest(
  props: TypeWriterTestProps
) {
  test('mapRuntypeName', async () => {
    const actual = (
      await generateFixture('typeNameFormat', ['B'], {
        ...props,
        generatorOpts: {
          runtypeFormat: `Mapped{type}Foo`,
          typeFormat: `Mapped{type}Bar`,
        },
      })
    ).getText()

    expect(actual).toMatchSnapshot()
  })

  test('incorrect formatting', async () => {
    await expect(() =>
      generateFixture('typeNameFormat', ['B'], {
        ...props,
        generatorOpts: {
          runtypeFormat: 'notypeparam',
        },
      })
    ).rejects.toThrow(
      `Type format must contain placeholder '{type}'. Got: "notypeparam".`
    )
  })
}
