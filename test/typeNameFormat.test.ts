import generateFixture from './generateFixture'

test('mapRuntypeName', async () => {
  const actual = (
    await generateFixture('typeNameFormat', ['B'], {
      generatorOpts: {
        runtypeFormat: `Mapped{type}Foo`,
        typeFormat: `Mapped{type}Bar`,
      },
    })
  ).getText()

  expect(actual).toMatchInlineSnapshot(`
    "import { Record, String, Static, Array } from 'runtypes';

    export const MappedAFoo = Record({ foo: String, });

    export type MappedABar = Static<typeof MappedAFoo>;

    export const MappedBFoo = Record({ bar: MappedAFoo, baz: MappedAFoo, nest: Record({ baz2: Array(MappedAFoo), }), });

    export type MappedBBar = Static<typeof MappedBFoo>;
    "
  `)
})

test('incorrect formatting', async () => {
  await expect(() =>
    generateFixture('typeNameFormat', ['B'], {
      generatorOpts: {
        runtypeFormat: 'notypeparam',
      },
    })
  ).rejects.toThrow(
    `Type format must contain placeholder '{type}'. Got: "notypeparam".`
  )
})
